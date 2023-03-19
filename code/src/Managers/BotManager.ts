import CommandHandler from '../Handlers/CommandHandler';
import IMessageInfo from '../Interfaces/IMessageInfo';
import { ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction, ThreadChannel, MessageReaction, User, SelectMenuInteraction } from 'discord.js';
import DiscordUtils from '../Utils/DiscordUtils';
import MessageService from '../Services/MessageService';
import ThreadHandler from '../Handlers/ThreadHandler';
import ReactionHandler from '../Handlers/ReactionHandler';
import OnboardingHandler from '../Handlers/OnboardingHandler';
import DiplomacyHandler from '../Handlers/DiplomacyHandler';
import NightsWatchManager from './NightsWatchManager';
import NightsWatchHandler from '../Handlers/NightsWatchHandler';
import VariableManager from './VariableManager';
import CommandManager from './CommandManager';
import LogService from '../Services/LogService';
import { LogType } from '../Enums/LogType';

export default class BotManager {

    public static async OnReady() {
        console.log('Eendragt: Connected');
        await VariableManager.InitializeVariables();
        NightsWatchManager.CreateNightCheckInterval();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    public static OnReactionAdd(reaction: MessageReaction, user: User) {
        ReactionHandler.OnReaction(reaction);
    }

    public static OnThreadCreate(thread: ThreadChannel) {
        ThreadHandler.OnThread(thread);
    }

    public static async OnInteractionCommand(interaction: ChatInputCommandInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);

        if (interaction.commandName == 'update') {
            CommandManager.UpdateSlashCommands();
            interaction.reply({
                content: 'Done!',
                ephemeral: true
            });

            LogService.Log(LogType.CommandsUpdate, messageInfo.user.id);
            return;
        }

        if (messageInfo.channel == null) {
            MessageService.ReplyMessage(messageInfo, 'Oeps, dat ging fout.');
            return;
        }
        CommandHandler.OnCommand(messageInfo, '');
    }

    public static async OnInteractionButton(interaction: ButtonInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        if (interaction.customId == 'onboarding_help') {
            OnboardingHandler.OnPlacer(messageInfo);
        } else if (interaction.customId == 'onboarding_diplomacy') {
            OnboardingHandler.OnStartDiplomacyOnboarding(messageInfo);
        } else if (interaction.customId == 'onboarding_observe') {
            OnboardingHandler.OnObserver(messageInfo);
        } else if (interaction.customId == 'onboarding_development') {
            OnboardingHandler.OnDevelopment(messageInfo);
        } else if (interaction.customId == 'diplomacy_report') {
            DiplomacyHandler.OnStartReport(messageInfo);
        } else if (interaction.customId.startsWith('diplomacy_claim')) {
            const id = interaction.customId.split('_')[2];
            DiplomacyHandler.OnClaim(messageInfo, id);
        } else if (interaction.customId.startsWith('nightswatch')) {
            NightsWatchHandler.OnButton(messageInfo);
        }
    }

    public static async OnInteractionModal(interaction: ModalSubmitInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        if (interaction.customId == 'onboarding_diplomacy') {
            OnboardingHandler.OnFinishDiplomacyOnboarding(messageInfo);
        } else if (interaction.customId == 'diplomacy_report') {
            DiplomacyHandler.OnFinishReport(messageInfo);
        }
    }

    public static async OnInteractionSelectMenu(interaction: SelectMenuInteraction) {
        const messageInfo: IMessageInfo = await DiscordUtils.ParseInteractionToInfo(interaction);
        if (interaction.customId == 'diplomacy_invite') {
            DiplomacyHandler.OnInvite(messageInfo);
        }
    }
}
