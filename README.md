# EthMessage

![screenshot](https://raw.githubusercontent.com/void4/ethmessage/master/screenshot.png)

With EthMessage you can pin messages to the world map.
The information is stored permanently in [IPFS](https://ipfs.io) and referenced by the [Ethereum](https://ethereum.org) Blockchain.

```javascript
var hashlistContract = web3.eth.contract([{"constant":false,"inputs":[{"name":"hash","type":"string"}],"name":"publish","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"hashes","outputs":[{"name":"","type":"string"}],"type":"function"},{"constant":true,"inputs":[],"name":"namecount","outputs":[{"name":"number","type":"uint256"}],"type":"function"}]);

hashlist = hashlistContract.at("0xc89a9ccdbc84d743c22a583d85931bb92c1bb78c")
```

You can also run this website locally with the [Meteor](https://meteor.com) framework. This requires an [IPFS](https://github.com/ipfs/go-ipfs) node and a [Geth](https://github.com/ethereum/go-ethereum/) instance with RPC enabled.

The contract is found in this directory (Hashlist.sol). It provides you with three methods: publish(hash), to add a new hash, namecount() to retrieve the number of hashes stored in the contract and hashes(index) to access the hash stored at the specified index. All messages have to adhere to the following schema:

```
CommentSchema = new SimpleSchema({
comment: {
  type: String
},
latitude: {
  type: Number,
  decimal: true,
  min: -90,
  max: 90
},
longitude: {
  type: Number,
  decimal: true,
  min: -180,
  max: 180
}
});
```

To insert messages manually, `ipfs add` your message and publish it to the blockchain.

```
export API_ORIGIN="http://localhost:3000"
ipfs daemon
```

```
geth --rpc --rpccorsdomain "localhost:3000" --unlock 0 console
```
Then enter the password of your first account.

```
meteor
```

Feel free to contribute!
