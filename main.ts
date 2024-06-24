import { App, Plugin, PluginSettingTab, Setting, Notice } from 'obsidian';
import * as chokidar from 'chokidar';

interface MyPluginSettings {
    mySetting: string;
    watchedFolder: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
    watchedFolder: '/home/abrax/Documents'
}

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;
    watcher: chokidar.FSWatcher;

    async onload() {
        await this.loadSettings();

        this.startWatching();

        // This creates an icon in the left ribbon.
        const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
            // Called when the user clicks the icon.
            new Notice('This is a notice!');
        });
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    startWatching() {
        this.watcher = chokidar.watch(this.settings.watchedFolder, { persistent: true });

        this.watcher.on('add', (path) => {
            new Notice(`File added: ${path}`);
            // Here you can start any actions you want to perform when a new file is added
        });

        this.watcher.on('change', (path) => {
            new Notice(`File changed: ${path}`);
        });

        this.watcher.on('unlink', (path) => {
            new Notice(`File removed: ${path}`);
        });
    }

    onunload() {
        if (this.watcher) {
            this.watcher.close();
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Setting #1')
            .setDesc('It\'s a secret')
            .addText(text => text
                .setPlaceholder('Enter your secret')
                .setValue(this.plugin.settings.mySetting)
                .onChange(async (value) => {
                    this.plugin.settings.mySetting = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Watched Folder')
            .setDesc('Folder to watch for changes')
            .addText(text => text
                .setPlaceholder('Enter folder path')
                .setValue(this.plugin.settings.watchedFolder)
                .onChange(async (value) => {
                    this.plugin.settings.watchedFolder = value;
                    await this.plugin.saveSettings();
                    this.plugin.startWatching(); // Restart watching with the new folder
                }));
    }
}
