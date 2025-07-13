import { stat } from 'fs';
import { Module } from 'module';
import { App, ButtonComponent, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface MrDNAPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MrDNAPluginSettings = {
	mySetting: 'default'
}

export default class MrDNAPlugin extends Plugin {
	settings: MrDNAPluginSettings;

	onUserEnable(): void {
		new Notice('MrDNA Plugin Enabled! (User Enable)');
	}

	async onload() {
		await this.loadSettings();

		// Display Notice 
		new Notice('MrDNA Plugin Loaded!');

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Notice Push', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			let randomNumber = Math.floor(Math.random() * 100) + 1;
			let message = `Notice Push: Random Number is ${randomNumber}`;
			new Notice(message);


			this.app.workspace.trigger('mrDNA:notice-push', message);
			this.app.workspace.rightSplit;
			new Notice(`Current File Path: ${this.app.workspace.getActiveFile()?.path}`);
		});

		// Adding CSS Styling to the ribbon icon if we want
		//ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Vibing');
		statusBarItemEl.onClickEvent((evt: MouseEvent) => {
			new Notice('Status Bar Clicked!');
			new StatusBarStatus(this.app, statusBarItemEl).open();
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class StatusBarStatus extends Modal {
	StatusBarItemEl: HTMLElement;

	constructor(app: App, statusBarItemEl: HTMLElement) {
		super(app);
		this.StatusBarItemEl = statusBarItemEl;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.style.display = 'flex';
		contentEl.style.flexDirection = 'column';
		contentEl.style.gap = '10px';

		contentEl.setText('Status Bar Clicked!');
	

		let textInput = contentEl.createEl('input');
		textInput.type = 'text';
		textInput.placeholder = 'Enter some text...';

		textInput.onchange = () => {
			new Notice(`You entered: ${textInput.value}`);
		};

		let statusDiv = contentEl.createDiv();

		statusDiv.style.display = 'flex';
		statusDiv.style.justifyContent = 'space-between';
		statusDiv.style.alignItems = 'center';
		statusDiv.style.flexDirection = 'row';

		statusDiv.createEl("p", { text: "Status Bar Status" });
		statusDiv.createEl("p", { text: "Click the button to close" });

		let button = contentEl.createEl('button');

		button.setText('Close');
		button.onclick = () => {
			new Notice('Status Bar Status Closed!');

			this.StatusBarItemEl.setText(`Vibing : ${textInput.value}`);

			new SampleModal(this.app).open();

			this.close();
		};
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MrDNAPlugin;

	constructor(app: App, plugin: MrDNAPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

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
	}
}
