/**
 * Created by Estevao on 27/01/2017.
 */
/*jshint expr: true*/
/*jshint -W053 */
/*jshint -W010 */
/*jshint -W009 */
var bootstrap = require('../bootstrap.js'),
    showdown = bootstrap.showdown;

describe('encodeEmailAddress()', function () {
  'use strict';
  var encoder = showdown.helper.encodeEmailAddress,
      email = 'foobar@example.com',
      encodedEmail = encoder(email);

  it('should encode email', function () {
    encodedEmail.should.not.equal(email);
  });

  it('should decode to original email', function () {
    var decodedEmail = encodedEmail.replace(/&#(.+?);/g, function (wm, cc) {
      if (cc.charAt(0) === 'x') {
        //hex
        return String.fromCharCode('0' + cc);
      } else {
        //dec
        return String.fromCharCode(cc);
      }
    });
    decodedEmail.should.equal(email);
  });
});

describe('isString()', function () {
  'use strict';
  var isString = showdown.helper.isString;

  it('should return true for new String Object', function () {
    isString(new String('some string')).should.be.true;
  });

  it('should return true for String Object', function () {
    isString(String('some string')).should.be.true;
  });

  it('should return true for string literal', function () {
    isString('some string').should.be.true;
  });

  it('should return false for integers', function () {
    isString(5).should.be.false;
  });

  it('should return false for random objects', function () {
    isString({foo: 'bar'}).should.be.false;
  });

  it('should return false for arrays', function () {
    isString(['bar']).should.be.false;
  });
});

describe('isFunction()', function () {
  'use strict';
  var isFunction = showdown.helper.isFunction;

  it('should return true for closures', function () {
    isFunction(function () {}).should.be.true;
  });

  it('should return true for defined functions', function () {
    function foo () {}
    isFunction(foo).should.be.true;
  });

  it('should return true for function variables', function () {
    var bar = function () {};
    isFunction(bar).should.be.true;
  });

  it('should return false for hash objects', function () {
    isFunction({}).should.be.false;
  });

  it('should return false for objects', function () {
    isFunction(new Object ()).should.be.false;
  });

  it('should return false for string primitives', function () {
    isFunction('foo').should.be.false;
  });
});

describe('isArray()', function () {
  'use strict';
  var isArray = showdown.helper.isArray;

  it('should return true for short syntax arrays', function () {
    isArray([]).should.be.true;
  });

  it('should return true for array objects', function () {
    var myArr = new Array();
    isArray(myArr).should.be.true;
  });

  it('should return false for functions', function () {
    isArray(function () {}).should.be.false;
    function baz () {}
    isArray(baz).should.be.false;
  });

  it('should return false for objects', function () {
    isArray({}).should.be.false;
    isArray(new Object ()).should.be.false;
  });

  it('should return false for strings', function () {
    isArray('foo').should.be.false;
    isArray(new String('foo')).should.be.false;
  });
});

describe('isUndefined()', function () {
  'use strict';
  var isUndefined = showdown.helper.isUndefined;

  it('should return true if nothing is passed', function () {
    isUndefined().should.be.true;
  });

  it('should return true if a variable is initialized but not defined', function () {
    var myVar;
    isUndefined(myVar).should.be.true;
  });

  it('should return false for null', function () {
    isUndefined(null).should.be.false;
  });

  it('should return false for 0', function () {
    isUndefined(0).should.be.false;
  });

  it('should return false for empty string', function () {
    isUndefined('').should.be.false;
  });

  it('should return false for empty booleans false or true', function () {
    isUndefined(false).should.be.false;
    isUndefined(true).should.be.false;
  });

  it('should return false for anything not undefined', function () {
    isUndefined('foo').should.be.false;
    isUndefined(2).should.be.false;
    isUndefined({}).should.be.false;
  });
});

describe('stdExtName()', function () {
  'use strict';
  var stdExtName = showdown.helper.stdExtName;

  it('should remove certain chars', function () {
    var str = 'bla_-  \nbla';
    //[_?*+\/\\.^-]
    stdExtName(str).should.not.match(/[_?*+\/\\.^-]/g);
  });
  it('should make everything lowercase', function () {
    var str = 'BLABLA';
    //[_?*+\/\\.^-]
    stdExtName(str).should.equal('blabla');
  });
});

describe('forEach()', function () {
  'use strict';
  var forEach = showdown.helper.forEach;

  it('should throw an error if first parameter is undefined', function () {
    (function () {forEach();}).should.throw('obj param is required');
  });

  it('should throw an error if second parameter is undefined', function () {
    (function () {forEach([]);}).should.throw('callback param is required');
  });

  it('should throw an error if second parameter is not a function', function () {
    (function () {forEach([], 'foo');}).should.throw('callback param must be a function/closure');
  });

  it('should throw an error if first parameter is not an object or an array', function () {
    (function () {forEach('foo', function () {});}).should.throw('obj does not seem to be an array or an iterable object');
  });

  it('should not throw even if object is empty', function () {
    (function () {forEach({}, function () {});}).should.not.throw();
  });

  it('should iterate array items', function () {
    var myArray = ['banana', 'orange', 'grape'];
    forEach(myArray, function (val, key, obj) {
      key.should.be.a('number');
      (key % 1).should.equal(0);
      val.should.equal(myArray[key]);
      obj.should.equal(myArray);
    });
  });

  it('should iterate over object properties', function () {
    var myObj = {foo: 'banana', bar: 'orange', baz: 'grape'};
    forEach(myObj, function (val, key, obj) {
      myObj.should.have.ownProperty(key);
      val.should.equal(myObj[key]);
      obj.should.equal(myObj);
    });
  });

  it('should iterate only over object own properties', function () {
    var Obj1 = {foo: 'banana'},
        myObj = Object.create(Obj1);
    myObj.bar = 'orange';
    myObj.baz = 'grape';

    myObj.should.have.ownProperty('bar');
    myObj.should.have.ownProperty('baz');
    myObj.should.not.have.ownProperty('foo');

    forEach(myObj, function (val, key) {
      key.should.not.equal('foo');
    });
  });
});
