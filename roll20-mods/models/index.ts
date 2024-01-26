export interface ChatEventDataExtended extends ChatEventData {
	rolledByCharacterId: string | any;
}

export interface Markers {
	[key: string]: string;
}

export enum EventTypes {
	Ready = 'ready',
	AddGraphic = 'add:graphic',
	ChatMessage = 'chat:message',
	ChangePage = 'change:page',
	ChangeGraphic = 'change:graphic',
	ChangeCharacter = 'change:character',
	ChangeAttribute = 'change:attribute',
	ChangeCampaignPlayerPageId = 'change:campaign:playerpageid',
	ChangeCampaignTurnOrder = 'change:campaign:turnorder',
	ChangePlayerOnline = 'change:player:_online',
	DestroyGraphic = 'destroy:graphic',
	ChangeHandout = 'change:handout',
}
