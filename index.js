const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const dns = require('dns');

// --- PARCHE DE DNS PARA HUGGING FACE ---
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

// Extraemos las variables de entorno
const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const STREAM_URL = process.env.STREAM_URL;

client.on('ready', () => {
    console.log(`>>> [SISTEMA]: ${client.user.tag} activo usando Variables de Entorno.`);
    
    // Buscamos el canal por el ID de la variable
    const channel = client.channels.cache.get(CHANNEL_ID);
    
    if (!channel) {
        return console.error(">>> [ERROR]: No se encontró el canal de voz. Revisa el CHANNEL_ID.");
    }

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: true,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(STREAM_URL, {
        inputType: StreamType.Arbitrary,
        inlineVolume: true
    });

    if (resource.volume) resource.volume.setVolume(0.8);
    
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Playing, () => console.log(">>> [RADIO]: ¡Aro verde activo! 🐾🟢"));
    
    player.on('error', error => {
        console.error(">>> [ERROR STREAM]:", error.message);
        // Re-intento automático
        setTimeout(() => {
            const newResource = createAudioResource(STREAM_URL, { inputType: StreamType.Arbitrary });
            player.play(newResource);
        }, 5000);
    });
});

client.login(TOKEN);
