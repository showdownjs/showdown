
describe('showdown.Converter.unlisten()', function () {
  'use strict';

  it('should remove a specific callback while leaving the others', function () {
    let converter = new showdown.Converter(),
        a = 0,
        b = 0,
        cbA = function (event) { a++; return event; },
        cbB = function (event) { b++; return event; };

    converter
      .listen('makehtml.onStart', cbA)
      .listen('makehtml.onStart', cbB)
      .unlisten('makehtml.onStart', cbA);

    converter.makeHtml('foo');
    expect(a).toBe(0);
    expect(b).toBe(1);
  });

  it('should remove every listener for an event when no callback is given', function () {
    let converter = new showdown.Converter(),
        count = 0,
        cb = function (event) { count++; return event; };

    converter
      .listen('makehtml.onEnd', cb)
      .listen('makehtml.onEnd', function (event) { count++; return event; })
      .unlisten('makehtml.onEnd');

    converter.makeHtml('foo');
    expect(count).toBe(0);
  });

  it('should remove all occurrences of the same callback', function () {
    let converter = new showdown.Converter(),
        count = 0,
        cb = function (event) { count++; return event; };

    converter
      .listen('makehtml.onStart', cb)
      .listen('makehtml.onStart', cb)
      .unlisten('makehtml.onStart', cb);

    converter.makeHtml('foo');
    expect(count).toBe(0);
  });

  it('should be a no-op for an event with no listeners', function () {
    let converter = new showdown.Converter();
    expect(function () {
      converter.unlisten('makehtml.onStart', function () {});
    }).not.toThrow();
  });

  it('should be case-insensitive about the event name', function () {
    let converter = new showdown.Converter(),
        count = 0,
        cb = function (event) { count++; return event; };

    converter.listen('makehtml.onStart', cb);
    converter.unlisten('MAKEHTML.ONSTART', cb);

    converter.makeHtml('foo');
    expect(count).toBe(0);
  });

  it('should throw when name is not a string', function () {
    let converter = new showdown.Converter();
    expect(function () {
      converter.unlisten(123, function () {});
    }).toThrow(/name must be a string/);
  });

  it('should throw when callback is given but is not a function', function () {
    let converter = new showdown.Converter();
    converter.listen('makehtml.onStart', function (event) { return event; });
    expect(function () {
      converter.unlisten('makehtml.onStart', 'notAFunction');
    }).toThrow(/callback must be a function/);
  });

  it('should return the converter (fluent interface)', function () {
    let converter = new showdown.Converter(),
        cb = function (event) { return event; };
    expect(converter.listen('makehtml.onStart', cb).unlisten('makehtml.onStart', cb)
    ).toBeInstanceOf(showdown.Converter);
  });
});
