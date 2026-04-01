---
title: Running as a Service
weight: 3
---

### Running LiteDAG with systemd

Run the node and staker as systemd services so they start on boot and restart on failure.

#### Node Service

Create `/etc/systemd/system/litedag-node.service`:

```ini
[Unit]
Description=LiteDAG Node
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=<your-user>
WorkingDirectory=/path/to/litedag-blockchain
ExecStart=/path/to/litedag-blockchain/litedag-node \
    --data-dir /path/to/litedag-blockchain/data \
    --public-rpc
Restart=on-failure
RestartSec=5
StandardInput=null
StandardOutput=journal
StandardError=journal
SyslogIdentifier=litedag-node

[Install]
WantedBy=multi-user.target
```

To also mine, add `--mine <your-wallet-address>` to the `ExecStart` line.

#### Staker Service

The staker signs PoS blocks and earns 40% of block rewards. It requires a local node running.

Create `/etc/systemd/system/litedag-staker.service`:

```ini
[Unit]
Description=LiteDAG Staker
After=litedag-node.service
Requires=litedag-node.service

[Service]
Type=simple
User=<your-user>
WorkingDirectory=/path/to/litedag-blockchain
EnvironmentFile=/path/to/litedag-blockchain/.staker.env
ExecStart=/path/to/litedag-blockchain/litedag-wallet-cli \
    --open-wallet <wallet-name> \
    --wallet-password ${STAKER_PASSWORD} \
    --start-staking delegate<id> \
    --non-interactive
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=litedag-staker

[Install]
WantedBy=multi-user.target
```

Create the password file:

```bash
echo "STAKER_PASSWORD=<your-password>" > /path/to/litedag-blockchain/.staker.env
chmod 600 /path/to/litedag-blockchain/.staker.env
```

#### Enable and Start

```bash
sudo systemctl daemon-reload
sudo systemctl enable litedag-node litedag-staker
sudo systemctl start litedag-node
sudo systemctl start litedag-staker
```

#### Useful Commands

```bash
sudo systemctl status litedag-node       # check node status
sudo systemctl status litedag-staker     # check staker status
sudo journalctl -u litedag-node -f       # follow node logs
sudo journalctl -u litedag-staker -f     # follow staker logs
sudo systemctl restart litedag-node      # restart node (staker restarts too)
```

#### See Also

- [Mining Guide](/docs/guides/mining) — How to mine LDG
- [Staking Guide](/docs/guides/staking) — How to stake and earn rewards
