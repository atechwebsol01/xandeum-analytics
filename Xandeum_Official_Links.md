OFFICIAL LINKS CHANNEL


**Main Websites**

✅  Xandeum Labs https://xandeum.com Software development

✅  Xandeum Foundation (Cayman) https://xandeum.org Assets Holding and Development Services 

✅  Xandeum Foundation (Panama) https://xandeum.network Token Issuer and marketing services 

✅  Xandeum Ventures https://xandeum.ventures/ Solana Validator and SOL Staking Service

✅  Xandeum Foundation DAO https://app.realms.today/dao/XAND

✅  Xandeum DevNet DAO (being sunsetted) https://app.realms.today/dao/XANDC

✅  Xandeum Discussion Forum <https://forum.xandeum.network/> XIP Proposal Discussions

✅  XAND Un-Staking https://stakexand.xandeum.network/ (Will deposit directly to your DAO governance wallet)

✅  Claim Rewards for Staking XAND in the DAO<https://stakexand.xandeum.network/rewards> 

✅  Claim Rewards for Staking SOL to the Liquid Staking Pool <https://xandsol.xandeum.network/rewards> 


**More Resources**
xandSOL vs SOL price chart https://www.birdeye.so/token/XAnDeUmMcqFyCdef9jzpNgtZPjTj3xUMj9eXKn2reFN/xanDnetFGrZkp49s8brXbg6T215JeDTeSfDF19wBiNQ?chain=solana
X Accounts - There are the only OFFICIAL team accounts that post to X
@XandeumNetwork https://twitter.com/xandeumnetwork
@XandeumFndation https://twitter.com/xandeumfndation
@bernieblume https://twitter.com/bernieblume
@TheFelixForster https://twitter.com/thefelixforster
@KuhlBrad https://twitter.com/kuhlbrad

NodeStore: https://get.xandeum.com
Blockchain Bernie: https://hau.to/blockchainbernie
Telegram https://t.me/xandeumlabs (not really used...but the only OFFICIAL Telegram!)
Affiliate Guide https://xandeum.com/affiliate-program/
Affiliate Setup https://get.xandeum.com/setup
Block Explorer https://explorer.xandeum.com

--------
XANDC Upgrade portal
Only for holders of the old token (XANDC) that wish to upgrade them to XAND at the launch.

<https://upgrade.xandeum.network/>

Use this to claim upgraded XANDC also!
--------

Airdrop Claim Portal
You can check your allocation now, 
Claim starts at 9am Pacific or <t:1730131200:f> In your computer's time zone.
https://airdrop.xandeum.network

XAND Stake Portal
You can stake your XAND for 42 days and 25% APY
24 hour opportunity October 28, 9 am PT to Ocotber 29, 8:50 am PT
https://stakexand.xandeum.network/

--------
@everyone
WATCH FOR FAKE TOKEN ADDRESSES

Mint Address: 
<https://solscan.io/token/XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx>

DEX
Some ways to find more info on token price and liquidity pools:
<https://birdeye.so/token/XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx?chain=solana>
<https://raydium.io/liquidity-pools/?tab=concentrated&token=XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx>
<https://jup.ag/swap/USDC-XANDuUoVoUqniKkpcKhrxmvYJybpJvUxJLr21Gaj3Hx>

CEX
<https://www.mexc.com/exchange/XAND_USDT?_from=search>
<https://www.mexc.com/price/XAND?calculatorTab=trade&utm_source=mexc&utm_medium=markets&utm_campaign=marketsdetails>

-------

----

Staking SOL into our Liquid Staking Pool 
https://xandsol.xandeum.network/

----

-----
Sanctum LST
<https://app.sanctum.so/lsts?search=xandsol>
-----

Price of xandSOL Liquid Staking Token on Birdeye.so
<https://birdeye.so/token/XAnDeUmMcqFyCdef9jzpNgtZPjTj3xUMj9eXKn2reFN?chain=solana>
----

-----
XAND Staking / Un-Staking
(Will deposit directly to your DAO governance wallet)
<https://stakexand.xandeum.network/>

-----

Xandeum Green Paper <https://greenpaper.xandeum.network/>
Why pNodes Matter - blog <https://www.xandeum.network/post/why-pnodes>
pNode Store <https://pnodestore.xandeum.network/>
pNode Setup Guide <https://docs.xandeum.network/xandeum-pnode-setup-guide> Updated 12/10/2025
-----

Our merch shop
https://xandeum.myspreadshop.com/

---------------------------
---------------------------
Official Xandeum Help Desk

📋 Multiple Ways to Get Support:

🌐 Web Portal: Visit https://help.xandeum.network/
Create an account and open a ticket for tracked support

📧 Direct Email Support:
• General Xandeum Questions: ask@help.xandeum.network
• Rewards & Airdrops: rewards@help.xandeum.network
• pNode & Validator Setup: pnodes@help.xandeum.network
• sedApp Development: dev@help.xandeum.network

Don't accept DM (Direct Message) offers for help!
The team will not DM you offering to help!
-----------------------------
-----------------------------

To anyone running a pNode without a pNode license...there is one final step to get it up and running:
Run as root user:
fallocate /xandeum-pages -l 10g
ln -s /xandeum-pages /run/xandeum-pod

This creates a 10gb file, and symlinks it to where the pod software is looking for it allowing pod to start.
It will be added to docs with the next release.

Adjust the size to what you want to allocate and then check the service
This allows it to start to use the pRPC, but does not allow you to be part of the incentivized DevNet payouts.

sudo systemctl status pod.service

Let me know if you see different results.