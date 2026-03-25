const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Radio PnH Online! 🐾');
}).listen(3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.on('ready', () => {
    console.log(`>>> [SISTEMA]: ${client.user.tag} activo en Replit. 🐾`);
    
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    if (!channel) return console.error(">>> [ERROR]: ID de canal no encontrado.");

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false // Importante para que no parezca que no escucha
    });

    const player = createAudioPlayer();

    const playStream = () => {
        console.log(">>> [RADIO]: Conectando flujo de ZenoFM... 🎧");
        const resource = createAudioResource(process.env.STREAM_URL, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });
        if (resource.volume) resource.volume.setVolume(0.8);
        player.play(resource);
        connection.subscribe(player);
    };

    playStream();

    player.on('stateChange', (old, newState) => {
        console.log(`>>> [AUDIO]: Estado actual: ${newState.status} 🟢`);
    });

    player.on('error', error => {
        console.error(">>> [ERROR]:", error.message);
        setTimeout(playStream, 5000);
    });
});

client.login(process.env.DISCORD_TOKEN);
