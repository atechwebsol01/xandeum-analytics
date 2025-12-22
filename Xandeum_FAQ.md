**What is Xandeum?**
1. **Xandeum** is a blockchain-based project that aims to provide a scalable storage solution for the Solana network.
2. The primary goal is to solve the "Blockchain Storage Trilemma" by offering a second-tier storage system that provides:
    * Smart contract native
    * Scalable
    * Random-access storage capabilities
3. To achieve this, Xandeum uses a network of pNodes (storage provider nodes) orchestrated by Solana RPC nodes.
4. The project also features a liquid staking pool and an associated DAO (Decentralized Autonomous Organization), which is governed by the XAND token.

**Airdrop, Liquid Staking Pool (With XAND Rewards), and Token Launch is OCTOBER 29th!!!**

LFG <:fluxrocket:827177658742734948> Xandeum Community!


<a:alert:940587734748250172> <a:alert:940587734748250172> <a:alert:940587734748250172> <a:alert:940587734748250172> 
BEWARE SCAMMERS IN DIRECT MESSGAES
Please disable your DM's from server members for your own safety!
Many scammers pose as Legitimate Server Users, making it hard to tell friend from foe in DM's!!!!

THE TEAM WILL NOT DM YOU!!!!!

For information on disabling DM's in Discord, visit the discord.com link below.
Also, always verify the domain on links, 

AND NEVER ENTER YOUR SEED PHRASE ANYWHERE AND BLOCK ANYONE WHO ASKS YOU FOR IT!!!
(EVEN IF YOU THINK YOU ARE TALKING TO AN ADMIN...YOU ARE NOT AND ARE ABOUT TO LOSE EVERYTHING!!!)

SCAMMERS are all around, stay safe!

Welcome to Xandeum!

https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings-


Disclaimer
NO FINANCIAL ADVICE– The Information on this channel, our websites, Blockchain Bernie, and/or any social media posts, are provided for educational, informational, and entertainment purposes only, without any express or implied warranty of any kind, including warranties of accuracy, completeness, or fitness for any particular purpose.

The information contained in or provided from or through this website and video channels is not intended to be and does not constitute financial advice, investment advice, trading advice, or any other advice.

The Information on this channel and provided from or through this website is general in nature and is not specific to you the user or anyone else. You should not make any decision, financial, investment, trading or otherwise, based on any of the information presented on this website without undertaking independent due diligence and consultation with a professional financial advisory.

You understand that you are using any and all Information available on or through this website at your own risk.

RISK STATEMENT– The buying or trading of any currency, or alternative crypto-currency, node or utility token has potential rewards, and it also has potential risks involved. Buying and/or trading may not be suitable for all people or legal in your jurisdiction. Anyone wishing to make a purchase should seek his or her own independent financial or professional or legal advice.

Do your own research, be mindful of scammers offering something too good to be true.


Can Tailscale get Xandeum pNodes multiple IP's assigned?

Tailscale does not assign multiple IP addresses to a single node by default. Each node is assigned a single IPv4 address from the 100.64.0.0/10 CGNAT range, 
which is used for private networking and is stable unless changed by an administrator.
 However, Tailscale does support assigning multiple IP addresses to a single node through advanced configuration, 
 such as using the ipPool feature in the tailnet policy to define specific IP ranges for nodes.
 This allows administrators to assign a node a specific IP address from a defined pool, 
 and while the documentation does not explicitly state that a single node can have multiple IPs from different pools simultaneously, 
 it does mention that multiple IP addresses can be assigned to a single interface in certain scenarios, such as for running multiple applications on different ports.
 For example, a node can be configured to have multiple secondary IP addresses on its interface, which can be useful for routing traffic to different services.
 However, this requires manual configuration and is not a standard feature for all users. The primary method for managing IP assignments is through the tailnet policy, 
 which allows administrators to define IP pools and assign specific IP addresses to nodes based on their role or group.
 Therefore, while Tailscale does not natively assign multiple IPs to a single node, it provides the tools for administrators to configure multiple IP addresses if needed.

 This command is supposed to return all pods...but its only a small subset...but the data format will be right. You can use your endpoint or any one that is public...
`yaml
curl -X POST http://192.190.136.28:6000/rpc \
  -H "Content-Type: application/json" \
  -d '{
  "jsonrpc": "2.0",
  "method": "get-pods",
  "id": 1
}'

{"error":null,"id":1,"jsonrpc":"2.0","result":{"pods":[{"address":"147.93.179.46:9001","last_seen_timestamp":1765121904,"pubkey":"ALY4mB2XANbtnuxd7XGRsvFhsnLkHhyTtTNbbtPNLL3V","version":"0.5.1"},{"address":"178.18.250.133:9001","last_seen_timestamp":1765124567,"pubkey":"Ajd5HeZUU5KRgHQ9RzLTe8EKfX6LneoPYwaAXVCmxYMm","version":"0.6.0"},{"address":"37.120.167.241:9001","last_seen_timestamp":1765124539,"pubkey":"5EnxQ57qzzqiXSuY7BbCXLucKevqZG4cFbnLjnVztutY","version":"0.6.0"},{"address":"192.190.136.38:9001","last_seen_timestamp":1765121904,"pubkey":"HjeRsvpPX4CnJAXW3ua2y1qrRA7t9nf8s4dYgJnavQnC","version":"0.6.0"},{"address":"173.249.36.181:9001","last_seen_timestamp":1765121904,"pubkey":"G7EvPwi8xhhRncfnrgicjQoBBV2fVGCHfBRGjB72vXWP","version":"0.5.1"},{"address":"213.199.44.36:9001","last_seen_timestamp":1765122767,"pubkey":"EasiV2wAcC4DR685UFj5VHgnqHtX8QVhJ8pywH4T6m51","version":"0.6.0"},{"address":"62.84.180.238:9001","last_seen_timestamp":1765123491,"pubkey":"3T3PXgZeLDtzvbvBQi5Y9vVNG52cz5TUKYK47ToVZN3A","version":"0.5.1"},{"address":"154.38.169.212:9001","last_seen_timestamp":1765123491,"pubkey":"Gknb28H1JL8DyL9RkSshkS8UxQhKGJLFdtfybdtUXc2E","version":"0.5.1"},{"address":"152.53.248.235:9001","last_seen_timestamp":1765123491,"pubkey":"XKZpmT4LzCspeZjmjjBEbwy8HKfBYdMakUmZHEnaaSx","version":"0.6.0"},{"address":"173.212.217.77:9001","last_seen_timestamp":1765123727,"pubkey":"39oZfP7VQbepDxXUz3g7sbopgxyHWzzmk7WYbfLtjP2X","version":"0.6.0"},{"address":"195.26.241.159:9001","last_seen_timestamp":1765123727,"pubkey":"F5zCNTjGPn8gfDEu9ppgNYLBafqSExzA68MfgHAYoF81","version":"0.6.0"},{"address":"84.21.171.129:9001","last_seen_timestamp":1765124299,"pubkey":"87gyhnKRxWTY1mowkwixMZdhu4K1buRyLzBi7wG2T4P9","version":"0.6.0"},{"address":"144.126.137.111:9001","last_seen_timestamp":1765124299,"pubkey":"7UNK4pm7zziAUz8XrnfxeS5z2P4aqyq6b6C2pWjMEWF9","version":"0.6.0"},{"address":"161.97.84.233:9001","last_seen_timestamp":1765124299,"pubkey":"FHcQdejQ8NncaSGQ6j5zrUuANxdVjnkDnLnwQPJfLLfL","version":"0.6.0"},{"address":"45.151.122.71:9001","last_seen_timestamp":1765124299,"pubkey":"5dkCbBDsWrvHQtcRAr3C2a3LSGoVe22ar7558oY4JxYE","version":"0.6.0"},{"address":"207.244.255.1:9001","last_seen_timestamp":1765124299,"pubkey":"2LkFCD5vpBcgch1LHbNd8vZmNpFMsgtaTDvzLLBYc7Uj","version":"0.6.0"},{"address":"173.249.42.124:9001","last_seen_timestamp":1765124299,"pubkey":"Cncj9NVQCGVhW6j8pxBJz1tBDAVJ5ZFMdYWAcZxAk8BA","version":"0.6.0"},{"address":"152.53.207.59:9001","last_seen_timestamp":1765124567,"pubkey":"Cfbha3M6eBpCBfZAVadt9eMGWBcbn78ePcEAHSHyGCY9","version":"0.6.0"},{"address":"38.242.244.211:9001","last_seen_timestamp":1765125021,"pubkey":"BA5TWqCA9zTCHNfoWSmH8E9izHtpnXRT9wFgk9Ceod3o","version":"0.6.0"},{"address":"152.53.155.15:9001","last_seen_timestamp":1765124567,"pubkey":"6PbJSbfG4pMneMoizZFNEfNkmBrL6frenKmDbqbBDcKq","version":"0.6.0"},{"address":"161.97.185.116:9001","last_seen_timestamp":1765125021,"pubkey":"G6uo53MmYaM9GmQysDLsTt3ppY89CwTmEuj6JoYb5XNt","version":"0.6.0"},{"address":"173.249.37.50:9001","last_seen_timestamp":1765125021,"pubkey":"6hNpdshq9w1m2D7YwYgWHgtxyhSmwbTAhaddCbxkhqj6","version":"0.5.1"}],"total_count":22}}
The more detailed call will return much more data for each pnode connected