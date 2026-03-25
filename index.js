const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const ffmpeg = require('ffmpeg-static');
const http = require('http');

// Mantenemos vivo el Replit
http.createServer((req, res) => {
    res.write('Radio Online! 🐾');
    res.end();
}).listen(3000);

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.on('ready', () => {
    console.log(`>>> [SISTEMA]: ${client.user.tag} listo. 🐾`);
    
    const channel = client.channels.cache.get(process.env.CHANNEL_ID);
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    const playStream = () => {
        // LA LÍNEA MÁGICA: Usamos ffmpeg para forzar el audio
        const resource = createAudioResource(process.env.STREAM_URL, {
            inputType: StreamType.Arbitrary,
            inlineVolume: true
        });

        if (resource.volume) resource.volume.setVolume(0.8);
        player.play(resource);
    };

    playStream();

    player.on('stateChange', (old, newState) => {
        console.log(`>>> [AUDIO]: El bot está ${newState.status} 🟢`);
    });

    player.on('error', error => {
        console.error(">>> [ERROR]:", error.message);
        setTimeout(playStream, 5000);
    });
});

client.login(process.env.DISCORD_TOKEN);
