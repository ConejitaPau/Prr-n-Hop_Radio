const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const http = require('http');

// --- SERVIDOR WEB PARA REPLIT ---
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Prr n Hop Radio está en línea! 🐾');
}).listen(3000);

const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] 
});

const STREAM_URL = process.env.STREAM_URL;
const CHANNEL_ID = process.env.CHANNEL_ID;

client.on('ready', () => {
    console.log(`>>> [SISTEMA]: ${client.user.tag} ha despertado en Replit. 🐾`);
    
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) return console.error(">>> [ERROR]: ID del canal no encontrado.");

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    const playStream = () => {
        try {
            const resource = createAudioResource(STREAM_URL, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true
            });
            
            if (resource.volume) resource.volume.setVolume(0.85);
            
            player.play(resource);
            console.log(">>> [RADIO]: ¡Enviando señal de audio! 🎧🟢");
        } catch (error) {
            console.error(">>> [ERROR]: Fallo al crear el recurso:", error);
            setTimeout(playStream, 5000); // Reintento en 5 segundos
        }
    };

    playStream();
    connection.subscribe(player);

    // Si hay un error en el reproductor, reiniciamos el flujo
    player.on('error', error => {
        console.error(">>> [ERROR STREAM]:", error.message);
        setTimeout(playStream, 5000);
    });

    // Si se queda inactivo por parpadeo de internet, reconectar
    player.on(AudioPlayerStatus.Idle, () => {
        console.log(">>> [RADIO]: Stream inactivo, reconectando...");
        playStream();
    });
});

client.login(process.env.DISCORD_TOKEN);
