const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const dns = require('dns');
const config = require('./config.json');

// --- EL PARCHE MAESTRO PARA HUGGING FACE ---
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.on('ready', () => {
    console.log(`>>> [SISTEMA]: ${client.user.tag} en línea desde la nube.`);
    const channel = client.guilds.cache.first().channels.cache.get(config.channelId);
    
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(config.streamUrl, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });

    if (resource.volume) resource.volume.setVolume(0.8);
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => console.log(">>> [RADIO]: Transmitiendo... 🐾🟢"));
});

client.login(config.token);
