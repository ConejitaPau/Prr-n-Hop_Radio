const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, NoSubscriberBehavior } = require('@discordjs/voice');
const { spawn } = require('child_process');

const config = {
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.CHANNEL_ID,
    streamUrl: process.env.STREAM_URL
};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
let connection = null;

async function conectarYTransmitir(channel) {
    try {
        console.log(`[Radio] Conectando a: ${channel.name}...`);
        connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const ffmpeg = spawn('ffmpeg', [
            '-re', '-i', config.streamUrl,
            '-af', 'volume=0.9',
            '-f', 's16le', '-ar', '48000', '-ac', '2', 'pipe:1'
        ]);

        const resource = createAudioResource(ffmpeg.stdout, { inputType: StreamType.Raw });
        connection.subscribe(player);
        player.play(resource);
        console.log(">>> [LOG]: ¡Transmitiendo en Discord! <<<");
    } catch (error) {
        console.error(`[ERROR]: ${error.message}`);
    }
}

client.on(Events.VoiceStateUpdate, (oldS, newS) => {
    const channel = client.channels.cache.get(config.channelId);
    if (!channel) return;
    const humans = channel.members.filter(m => !m.user.bot).size;
    if (humans > 0 && !connection) {
        conectarYTransmitir(channel);
    } else if (humans === 0 && connection) {
        connection.destroy();
        connection = null;
        player.stop();
    }
});

client.once(Events.ClientReady, (c) => console.log(`>>> Bot ONLINE: ${c.user.tag}`));
client.login(config.token);