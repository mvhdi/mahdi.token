// testing

// import token
var MahdiToken = artifacts.require("./MahdiToken.sol"); 

// contract tests to ensure function in MahdiToken.sol work properly
contract('MahdiToken', function(accounts) {
// test token has correct identity
	it('initalizes the contract with the correct values', function() {
		return MahdiToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, 'MahdiToken', 'has the correct name');
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, 'MAHDI', 'has the correct symbol')
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, "MahdiToken v1.0", 'has the correct standard');

		});
	})
// test setting inital supply
	it('upon deployment allocates the inital supply',function() {
		return MahdiToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets supply to 1,000,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the inital supply to the admin account');
		});
	});

//test transfer function, and triggering transfer event
	it('transfers token ownership', function() {
		return MahdiToken.deployed().then(function(instance) {
			tokenInstance = instance;
			// test 'require' statement by trying to transfer more than is in an account
			return tokenInstance.transfer.call(accounts[1], 99999999999999999);
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >=0, 'error message must contain revert');
			//test boolean returned, without triggering actual transaction, just see what is returned.
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0]})
		}).then(function(success) {
			assert.equal(success, true, 'it returns true');
		
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
			return tokenInstance.balanceOf(accounts[1]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 250000, 'adds amount to the recieving account');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 750000, 'deducts the amount from the sending account');
		});
	});




})