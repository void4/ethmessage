contract Hashlist {

  string[] public hashes;

  function namecount() constant returns (uint256 number) {
    return hashes.length;
  }

  function publish(string hash) {
    hashes.length++;
    hashes[hashes.length-1] = hash;
  }
  
  function() {}
}
