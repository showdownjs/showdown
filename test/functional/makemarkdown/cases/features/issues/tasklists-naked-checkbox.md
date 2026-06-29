A naked checkbox outside any list stays raw HTML:

<input type="checkbox"> not a task

An inline checkbox in flowing text also stays raw: toggle <input type="checkbox" checked=""> here

<div><input type="checkbox"> inside a div, still raw</div>

Only a checkbox inside a list item becomes a task marker:

- [ ] open task
- [x] done task
