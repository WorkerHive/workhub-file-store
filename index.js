global.btoa = str => Buffer.from(str).toString('base64');
global.atob = str => Buffer.from(str, 'base64').toString();

import P2P from './p2p-bundle.js';
import IPFS from 'ipfs';
import pnet from 'libp2p/src/pnet/index.js';

import uint8tobase64 from 'uint8-to-base64'
const { generate } = pnet;
const { decode, encode } = uint8tobase64

const FileStore = async (config = {}) => {
    //Host setup
    let host = config.host;
    let port = config.port || 0;
    //Swarm key setup
    let swarmKey = new Uint8Array(95);
    if(config.swarmKey) swarmKey = decode(config.swarmKey);
    if(!config.swarmKey) generate(swarmKey);

    let swarmAddrs = [
        `/dns4/${host}/tcp/6969/wss/p2p-webrtc-star`,
        `/ip4/0.0.0.0/tcp/${port}`
    ]

    console.log(swarmAddrs)

    let node = await IPFS.create({
        repo: config.repo || 'workhub',
        config: {
            Addresses: {
                Swarm: swarmAddrs
            }
        },
        libp2p: P2P(swarmKey)
    })

    setInterval(async () => {
        try {
          const peers = await node.swarm.peers()
          console.log(`The node now has ${JSON.stringify(peers)} peers.`)
        } catch (err) {
          console.log('An error occurred trying to check our peers:', err)
        }
      }, 2000)

    node.libp2p.on('peer:discovery', (peer) => {
        let p = JSON.parse(JSON.stringify(peer))
        console.log('Discovered %s', p.id) // Log discovered peer

      node.swarm.connect(`/dns4/${host}/tcp/6969/wss/p2p-webrtc-star/ipfs/${p.id}`).catch((err) => console.log(err))
    })

    node.libp2p.on('peer:connect', (peer) => {
      console.log('Connected to peer')
    })

    return {
        node,
        swarmKey: encode(swarmKey)
    }
}

export default FileStore

