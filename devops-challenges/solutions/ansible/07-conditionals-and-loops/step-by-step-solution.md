# Solution — Conditionals and Loops

## Fixes Applied

### Fix 1: Case-sensitive OS family comparison

```yaml
# Before
when: ansible_os_family == "ubuntu"

# After
when: ansible_os_family == "Debian"
```

`ansible_os_family` returns `"Debian"` (capital D) on Ubuntu/Debian systems. `"ubuntu"` is lowercase and never matches — the task is silently skipped on every Ubuntu host.

### Fix 2: Loop item reference matches list type

```yaml
# Before — list of strings but using item.name (dict access)
- name: "{{ item.name }}"
loop:
  - alice
  - bob

# After
- name: "{{ item }}"    # string list uses {{ item }} directly
loop:
  - alice
  - bob
```

### Fix 3: Replace `with_items` with `loop`

```yaml
# Before (deprecated)
with_items:
  - git
  - curl

# After
loop:
  - git
  - curl
```

`with_items` was deprecated in Ansible 2.5. Use `loop:` for new playbooks.

### Fix 4 & 5: Guard debug task with `when:`

```yaml
- name: Check disk space
  ansible.builtin.command: df -h /
  register: disk_output
  failed_when: false   # capture output even if command fails

- name: Show disk info
  ansible.builtin.debug:
    msg: "{{ disk_output.stdout }}"
  when: disk_output.rc == 0   # only show output if command succeeded
```

`failed_when: disk_output.rc != 0` is redundant (that's the default behavior). Using `when: disk_output.rc == 0` on the debug task guards against accessing stdout from a failed command.
