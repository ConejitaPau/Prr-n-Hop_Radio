const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const http = require('http');

// --- SERVIDOR WEB PARA REPLIT ---
// Esto evita que Replit apague el bot a los pocos minutos
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Prr n Hop Radio está en línea! 🐾');
}).listen(3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] 
});

const STREAM_URL = process.env.STREAM_URL; // URL de ZenoFM
const CHANNEL_ID = process.env.CHANNEL_ID;

client.on('ready', () => {
    console.log(`>>> [SISTEMA]: ${client.user.tag} ha despertado en Replit. 🐾`);
    
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) return console.error(">>> [ERROR]: No encontré el ID del canal de voz.");

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    const playStream = () => {
        const resource = createAudioResource(STREAM_URL, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });
        if (resource.volume) resource.volume.setVolume(0.8);
        player.play(resource);
        console.log(">>> [RADIO]: Reproduciendo stream de ZenoFM... 🎧🟢");
    };

    playStream();
    connection.subscribe(player);

    // Si el reproductor se detiene por error, intenta reconectar en 5 segundos
    player.on('error', error => {
        console.error(">>> [ERROR STREAM]:", error.message);
        setTimeout(playStream, 5000);
    });

    player.on(AudioPlayerStatus.Idle, () => {
        console.log(">>> [RADIO]: Stream inactivo, reintentando...");
        playStream();
    });
});

client.login(process.env.DISCORD_TOKEN);
