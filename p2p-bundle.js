import Libp2p from 'libp2p';
import MDNS from 'libp2p-mdns';
import TCP from 'libp2p-tcp';
import MPLEX from 'libp2p-mplex';
import noise from 'libp2p-noise';
import Protector from 'libp2p/src/pnet/index.js';
import WebRTCStar from 'libp2p-webrtc-star'

import wrtc from 'wrtc';

const { NOISE } = noise;
const transportKey = WebRTCStar.prototype[Symbol.toStringTag]

export default (swarmKey) => {
    return {
        modules: {
            transport: [TCP, WebRTCStar],
            streamMuxer: [MPLEX],
            connEncryption: [NOISE],
            connProtector: new Protector(swarmKey)
        },
        config: {
            transport: {
                [transportKey]: {
                    enabled: true,
                    wrtc
                }
            },
            peerDiscovery: {
                autoDial: true,
                [WebRTCStar.tag]: {
                    enabled: true
                },
                [MDNS.tag]:{
                    enabled: true
                },
            }
        }
    }
}
