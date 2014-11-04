
#!/usr/bin/kivy
import kivy
kivy.require('1.4.2')
import os
import sys
from kivy.config import Config
Config.set('graphics', 'borderless', 1)
Config.set('kivy', 'log_level', 'warning')
from kivy.app import App
from kivy.factory import Factory
from kivy.lang import Builder, Parser, ParserException
from kivy.properties import ObjectProperty
from kivy.compat import PY2
from kivy.uix.boxlayout import BoxLayout
from kivy.clock import Clock

PIPE_THREAD = None

CATALOG_ROOT = os.path.dirname(__file__)

# Config.set('graphics', 'width', '1024')
# Config.set('graphics', 'height', '768')

'''List of classes that need to be instantiated in the factory from .kv files.
'''
CONTAINER_KVS = os.path.join(CATALOG_ROOT, 'container_kvs')
CONTAINER_CLASSES = [c[:-3] for c in os.listdir(CONTAINER_KVS)
                     if c.endswith('.kv')]

CATALOG = None


class Container(BoxLayout):

    '''A container is essentially a class that loads its root from a known
    .kv file.

    The name of the .kv file is taken from the Container's class.
    We can't just use kv rules because the class may be edited
    in the interface and reloaded by the user.
    See :meth: change_kv where this happens.
    '''

    def __init__(self, **kwargs):
        super(Container, self).__init__(**kwargs)
        parser = Parser(content=open(self.kv_file).read())
        widget = Factory.get(parser.root.name)()
        Builder._apply_rule(widget, parser.root, parser.root)
        self.add_widget(widget)

    @property
    def kv_file(self):
        '''Get the name of the kv file, a lowercase version of the class
        name.
        '''
        return os.path.join(CONTAINER_KVS, self.__class__.__name__ + '.kv')


for class_name in CONTAINER_CLASSES:
    globals()[class_name] = type(class_name, (Container,), {})


class Catalog(BoxLayout):

    '''Catalog of widgets. This is the root widget of the app. It contains
    a tabbed pain of widgets that can be displayed and a textbox where .kv
    language files for widgets being demoed can be edited.

    The entire interface for the Catalog is defined in kivycatalog.kv,
    although individual containers are defined in the container_kvs
    directory.

    To add a container to the catalog,
    first create the .kv file in container_kvs
    The name of the file (sans .kv) will be the name of the widget available
    inside the kivycatalog.kv
    Finally modify kivycatalog.kv to add an AccordionItem
    to hold the new widget.
    Follow the examples in kivycatalog.kv to ensure the item
    has an appropriate id and the class has been referenced.

    You do not need to edit any python code, just .kv language files!
    '''
    language_box = ObjectProperty()
    screen_manager = ObjectProperty()

    def __init__(self, **kwargs):
        self._previously_parsed_text = ''
        super(Catalog, self).__init__(**kwargs)
        self.show_kv(None, 'Visible')
        self.carousel = None
        self.screen = ''

    def show_kv(self, instance, value):
        '''Called when an a item is selected, we need to show the .kv language
        file associated with the newly revealed container.'''

        self.screen_manager.current = value

        child = self.screen_manager.current_screen.children[0]
        with open(child.kv_file, 'rb') as file:
            self.screen = file.read().decode('utf8')

    def schedule_reload(self):
        if self.auto_reload:
            txt = self.screen
            if txt == self._previously_parsed_text:
                return
            self._previously_parsed_text = txt
            Clock.unschedule(self.change_kv)
            Clock.schedule_once(self.change_kv, 2)

    def change_kv(self, *largs):
        '''Called when the update button is clicked. Needs to update the
        interface for the currently active kv widget, if there is one based
        on the kv file the user entered. If there is an error in their kv
        syntax, show a nice popup.'''

        txt = self.screen
        kv_container = self.screen_manager.current_screen.children[0]
        try:
            parser = Parser(content=txt)
            kv_container.clear_widgets()
            widget = Factory.get(parser.root.name)()
            Builder._apply_rule(widget, parser.root, parser.root)
            kv_container.add_widget(widget)
        except (SyntaxError, ParserException) as e:
            self.show_error(e)
        except Exception as e:
            self.show_error(e)

    def show_error(self, e):
        self.info_label.text = str(e)
        self.anim = Animation(top=190.0, opacity=1, d=2, t='in_back') +\
            Animation(top=190.0, d=3) +\
            Animation(top=0, opacity=0, d=2)
        self.anim.start(self.info_label)


class MainApp(App):

    '''The kivy App that runs the main root. All we do is build a catalog
    widget into the root.'''

    def build(self):
        self.last_update_timestamp = None
        self.server_state = None
        self.listen_for_commands()
        global CATALOG
        CATALOG = Catalog()
        return CATALOG

    def on_pause(self):
        return True

    def listen_for_commands(self):
        import threading
        PIPE_THREAD = threading.Thread(
            target=self._watch_for_server_state_change)
        PIPE_THREAD.daemon = True
        PIPE_THREAD.start()

    def _watch_for_server_state_change(self):
        import time
        while True:
            timestamp = os.stat('/tmp/rpid-io-pipe').st_mtime

            if not self.last_update_timestamp or timestamp > self.last_update_timestamp:
                print('UIMan is reading the updated server state')
                self.last_update_timestamp = timestamp
                with (open('/tmp/rpid-io-pipe', 'r')) as pipe:
                    content = pipe.read()
                    self.update_server_state(content)
            else:
                time.sleep(1)

    def update_server_state(self, content):
        import json
        try:
            self.server_state = json.loads(content)
        except ValueError as e:
            print(e)
        self.update_ui()

    def update_ui(self):
        print('UIMan is updating the UI')
        if not self.server_state:
            self.show()
            return

        state = self.server_state.get('player_state')
        print(state)
        if state == 'Playing':
            self.hide()
            return

        if state == 'Stopped':
            self.show()
            return

        if state == 'Paused':
            self.hide()
            return

        if state == "Waiting":
            self.show()
            return

    def show(self):
        if CATALOG:
            print('Showing the UI')
            CATALOG.show_kv(None, 'Visible')

    def hide(self):
        if CATALOG:
            print('Hiding the UI')
            CATALOG.show_kv(None, 'Hidden')


def set_procname(newname):
    from ctypes import cdll, byref, create_string_buffer
    libc = cdll.LoadLibrary('libc.so.6')  # Loading a 3rd party library C
    # Note: One larger than the name (man prctl says that)
    buff = create_string_buffer(len(newname) + 1)
    buff.value = newname  # Null terminated string as it should be
    # Refer to "#define" of "/usr/include/linux/prctl.h" for the misterious
    # value
    libc.prctl(15, byref(buff), 0, 0, 0)


if __name__ == "__main__":
    set_procname('rpid-ui')
    import os
    if ('NODE_ENV' in os.environ and os.environ['NODE_ENV'] == 'production'):
        Config.set('graphics', 'fullscreen', 1)
    else:
        Config.set('graphics', 'width', 1368)
        Config.set('graphics', 'height', 768)

    Config.set('graphics', 'borderless', 1)
    Config.set('kivy', 'log_level', 'warning')
    Config.write()
    try:
        MainApp().run()
    except KeyboardInterrupt, SystemExit:
        if PIPE_THREAD:
            PIPE_THREAD.terminate()
        sys.exit()
