/**
 * Created by Tivie on 27/01/2017.
 */
/*jshint expr: true*/
/*jshint -W053 */
/*jshint -W010 */
/*jshint -W009 */

describe('encodeEmailAddress()', function () {
  'use strict';
  let encoder = showdown.helper.encodeEmailAddress,
      email = 'foobar@example.com',
      encodedEmail = encoder(email),
      encodedEmail2 = encoder(email);

  it('should encode email', function () {
    expect(encodedEmail).not.toBe(email);
  });

  it('should encode email determinated', function () {
    expect(encodedEmail).toBe(encodedEmail2);
  });

  it('should decode to original email', function () {
    let decodedEmail = encodedEmail.replace(/&#(.+?);/g, function (wm, cc) {
      if (cc.charAt(0) === 'x') {
        //hex
        return String.fromCharCode('0' + cc);
      } else {
        //dec
        return String.fromCharCode(cc);
      }
    });
    expect(decodedEmail).toBe(email);
  });
});

describe('isString()', function () {
  'use strict';
  let isString = showdown.helper.isString;

  it('should return true for new String Object', function () {
    expect(isString(new String('some string'))).toBe(true);
  });

  it('should return true for String Object', function () {
    expect(isString(String('some string'))).toBe(true);
  });

  it('should return true for string literal', function () {
    expect(isString('some string')).toBe(true);
  });

  it('should return false for integers', function () {
    expect(isString(5)).toBe(false);
  });

  it('should return false for random objects', function () {
    expect(isString({foo: 'bar'})).toBe(false);
  });

  it('should return false for arrays', function () {
    expect(isString(['bar'])).toBe(false);
  });
});

describe('isFunction()', function () {
  'use strict';
  let isFunction = showdown.helper.isFunction;

  it('should return true for closures', function () {
    expect(isFunction(function () {})).toBe(true);
  });

  it('should return true for defined functions', function () {
    function foo () {}
    expect(isFunction(foo)).toBe(true);
  });

  it('should return true for function letiables', function () {
    let bar = function () {};
    expect(isFunction(bar)).toBe(true);
  });

  it('should return false for hash objects', function () {
    expect(isFunction({})).toBe(false);
  });

  it('should return false for objects', function () {
    expect(isFunction(new Object ())).toBe(false);
  });

  it('should return false for string primitives', function () {
    expect(isFunction('foo')).toBe(false);
  });
});

describe('isArray()', function () {
  'use strict';
  let isArray = showdown.helper.isArray;

  it('should return true for short syntax arrays', function () {
    expect(isArray([])).toBe(true);
  });

  it('should return true for array objects', function () {
    let myArr = new Array();
    expect(isArray(myArr)).toBe(true);
  });

  it('should return false for functions', function () {
    expect(isArray(function () {})).toBe(false);
    function baz () {}
    expect(isArray(baz)).toBe(false);
  });

  it('should return false for objects', function () {
    expect(isArray({})).toBe(false);
    expect(isArray(new Object ())).toBe(false);
  });

  it('should return false for strings', function () {
    expect(isArray('foo')).toBe(false);
    expect(isArray(new String('foo'))).toBe(false);
  });
});

describe('isUndefined()', function () {
  'use strict';
  let isUndefined = showdown.helper.isUndefined;

  it('should return true if nothing is passed', function () {
    expect(isUndefined()).toBe(true);
  });

  it('should return true if a letiable is initialized but not defined', function () {
    // eslint-disable-next-line no-unassigned-vars -- deliberately unassigned to test isUndefined()
    let myVar;
    expect(isUndefined(myVar)).toBe(true);
  });

  it('should return false for null', function () {
    expect(isUndefined(null)).toBe(false);
  });

  it('should return false for 0', function () {
    expect(isUndefined(0)).toBe(false);
  });

  it('should return false for empty string', function () {
    expect(isUndefined('')).toBe(false);
  });

  it('should return false for empty booleans false or true', function () {
    expect(isUndefined(false)).toBe(false);
    expect(isUndefined(true)).toBe(false);
  });

  it('should return false for anything not undefined', function () {
    expect(isUndefined('foo')).toBe(false);
    expect(isUndefined(2)).toBe(false);
    expect(isUndefined({})).toBe(false);
  });
});

describe('stdExtName()', function () {
  'use strict';
  let stdExtName = showdown.helper.stdExtName;

  it('should remove certain chars', function () {
    let str = 'bla_-  \nbla';
    expect(//[_?*+\/\\.^-]
      stdExtName(str)).not.toMatch(/[_?*+/\\.^-]/g);
  });
  it('should make everything lowercase', function () {
    let str = 'BLABLA';
    expect(//[_?*+\/\\.^-]
      stdExtName(str)).toBe('blabla');
  });
});

describe('forEach()', function () {
  'use strict';
  let forEach = showdown.helper.forEach;

  it('should throw an error if first parameter is undefined', function () {
    expect((function () {forEach();})).toThrow('obj param is required');
  });

  it('should throw an error if second parameter is undefined', function () {
    expect((function () {forEach([]);})).toThrow('callback param is required');
  });

  it('should throw an error if second parameter is not a function', function () {
    expect((function () {forEach([], 'foo');})).toThrow('callback param must be a function/closure');
  });

  it('should throw an error if first parameter is not an object or an array', function () {
    expect((function () {forEach('foo', function () {});})).toThrow('obj does not seem to be an array or an iterable object');
  });

  it('should not throw even if object is empty', function () {
    expect((function () {forEach({}, function () {});})).not.toThrow();
  });

  it('should iterate array items', function () {
    let myArray = ['banana', 'orange', 'grape'];
    forEach(myArray, function (val, key, obj) {
      expect(key).toBeTypeOf('number');
      expect((key % 1)).toBe(0);
      expect(val).toBe(myArray[key]);
      expect(obj).toBe(myArray);
    });
  });

  it('should iterate over object properties', function () {
    let myObj = {foo: 'banana', bar: 'orange', baz: 'grape'};
    forEach(myObj, function (val, key, obj) {
      expect(Object.prototype.hasOwnProperty.call(myObj, key)).toBe(true);
      expect(val).toBe(myObj[key]);
      expect(obj).toBe(myObj);
    });
  });

  it('should iterate only over object own properties', function () {
    let Obj1 = {foo: 'banana'},
        myObj = Object.create(Obj1);
    myObj.bar = 'orange';
    myObj.baz = 'grape';

    expect(Object.prototype.hasOwnProperty.call(myObj, 'bar')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(myObj, 'baz')).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(myObj, 'foo')).toBe(false);

    forEach(myObj, function (val, key) {
      expect(key).not.toBe('foo');
    });
  });
});

describe('matchRecursiveRegExp()', function () {
  'use strict';

  let rRegExp = showdown.helper.matchRecursiveRegExp;

  it('should match nested elements', function () {
    let result = rRegExp('<div><div>a</div></div>', '<div\\b[^>]*>', '</div>', 'gim');
    expect(result).toEqual([['<div><div>a</div></div>', '<div>a</div>', '<div>', '</div>']]);
  });

});

describe('repeat()', function () {
  'use strict';
  it('work produce the same output as String.prototype.repeat()', function () {
    if (typeof String.prototype.repeat !== 'undefined') {
      let str = 'foo',
          expected = str.repeat(100),
          actual = showdown.helper.repeat(str, 100);
      expect(expected).toBe(actual);
    }
  });
});
