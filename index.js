const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
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
    if (!channel) return console.error(">>> [ERROR]: ID del canal no encontrado en Discord.");

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    // Sensor de conexión de voz
    connection.on(VoiceConnectionStatus.Ready, () => {
        console.log(">>> [VOZ]: Conexión establecida con el canal de voz. 🔊");
    });

    const player = createAudioPlayer();

    const playStream = () => {
        try {
            console.log(">>> [RADIO]: Intentando inyectar audio de ZenoFM... 🎧");
            
            const resource = createAudioResource(STREAM_URL, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true
            });
            
            if (resource.volume) resource.volume.setVolume(0.85);
            
            player.play(resource);
            connection.subscribe(player);
        } catch (error) {
            console.error(">>> [ERROR AL REPRODUCIR]:", error);
            setTimeout(playStream, 5000);
        }
    };

    playStream();

    // --- SENSORES DE ESTADO DEL REPRODUCTOR ---
    player.on('stateChange', (oldState, newState) => {
        console.log(`>>> [ESTADO]: El audio pasó de ${oldState.status} a ${newState.status} 🟢`);
        
        // Si el audio se detiene por error, lo forzamos a reiniciar
        if (newState.status === AudioPlayerStatus.Idle) {
            console.log(">>> [RADIO]: Audio en pausa o terminado, reiniciando flujo...");
            playStream();
        }
    });

    player.on('error', error => {
        console.error(">>> [ERROR CRÍTICO]: Falló el motor de audio:", error.message);
        setTimeout(playStream, 5000);
    });
});

client.login(process.env.DISCORD_TOKEN);
