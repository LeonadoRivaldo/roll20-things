"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventTypes = void 0;
var EventTypes;
(function (EventTypes) {
    EventTypes["Ready"] = "ready";
    EventTypes["AddGraphic"] = "add:graphic";
    EventTypes["ChatMessage"] = "chat:message";
    EventTypes["ChangePage"] = "change:page";
    EventTypes["ChangeGraphic"] = "change:graphic";
    EventTypes["ChangeCharacter"] = "change:character";
    EventTypes["ChangeAttribute"] = "change:attribute";
    EventTypes["ChangeCampaignPlayerPageId"] = "change:campaign:playerpageid";
    EventTypes["ChangeCampaignTurnOrder"] = "change:campaign:turnorder";
    EventTypes["ChangePlayerOnline"] = "change:player:_online";
    EventTypes["DestroyGraphic"] = "destroy:graphic";
    EventTypes["ChangeHandout"] = "change:handout";
})(EventTypes || (exports.EventTypes = EventTypes = {}));
