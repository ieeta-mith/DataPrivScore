import type { PluginUIExtension } from '@/types/privacy-plugins';

class UIRegistry {
	private static instance: UIRegistry;
	private extensions: Map<string, PluginUIExtension> = new Map();

	private constructor() {}

	static getInstance(): UIRegistry {
		if (!UIRegistry.instance) {
			UIRegistry.instance = new UIRegistry();
		}
		return UIRegistry.instance;
	}

	register(extension: PluginUIExtension): void {
		if (this.extensions.has(extension.id)) {
			console.warn(`UI extension with id ${extension.id} is already registered. Overwriting.`);
		}
		this.extensions.set(extension.id, extension);
	}

	getExtension(id: string): PluginUIExtension | undefined {
		return this.extensions.get(id);
	}

	getAllExtensions(): PluginUIExtension[] {
		return Array.from(this.extensions.values());
	}

	reset(): void {
		this.extensions.clear();
	}
}

export const uiRegistry = UIRegistry.getInstance();

export function registerUIExtension(extension: PluginUIExtension): void {
	uiRegistry.register(extension);
}

export function getUIExtension(id: string): PluginUIExtension | undefined {
	return uiRegistry.getExtension(id);
}

export function getAllUIExtensions(): PluginUIExtension[] {
	return uiRegistry.getAllExtensions();
}
