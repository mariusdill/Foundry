# shadcn/ui v4 Full Setup Guide for Foundry

## Overview

shadcn/ui v4 (released March 6, 2026) transforms the CLI into a powerful, agent-native system with blocks, presets, and enhanced tooling.

## ✅ Successfully Configured Features

### 1. Core CLI Commands

```bash
# Version 4.0.0 installed
npx shadcn@latest --version  # → 4.0.0

# Project info (JSON output for agents)
npx shadcn@latest info --json

# Component documentation
npx shadcn@latest docs button --json

# View component source before installing
npx shadcn@latest view button
```

### 2. Safer Workflows (CRITICAL for AI Agents)

```bash
# Preview what will be installed
npx shadcn@latest add COMPONENT --dry-run

# See exact file changes
npx shadcn@latest add COMPONENT --diff

# View file contents
npx shadcn@latest add COMPONENT --view
```

### 3. Registry Search & Discovery

```bash
# Search all available items (403 items in @shadcn registry)
npx shadcn@latest search @shadcn

# Available types:
# - registry:ui (50+ components)
# - registry:block (30+ page templates)
# - registry:style (themes)
# - registry:lib (utilities)
# - registry:hook (custom hooks)
```

### 4. Blocks (Complete Page Templates)

**Available Blocks:**

- `dashboard-01` - Full dashboard with sidebar, charts, data table
- `sidebar-01` through `sidebar-16` - Various sidebar layouts
- `login-01` through `login-05` - Login page templates
- `signup-01` through `signup-05` - Signup page templates
- `chart-area-*` - Chart components

**Install a block:**

```bash
npx shadcn@latest add dashboard-01
# Installs 34 files, 14 deps, 16 CSS variables
```

### 5. Installed Components (21 total)

```
UI Components:
├── avatar, badge, breadcrumb, button, card
├── command, dialog, dropdown-menu, form
├── input, label, scroll-area, select
├── separator, sheet, sidebar, skeleton
├── switch, checkbox, table, tabs, textarea
├── tooltip, toggle-group
```

### 6. Project Configuration

**Current Setup:**

- Framework: Next.js 15.5.12
- Style: new-york
- Base: radix
- TypeScript: Yes
- RSC: Yes
- Tailwind: v4
- Icon Library: lucide

**Aliases:**

```typescript
@/components     → src/components
@/components/ui  → src/components/ui
@/lib            → src/lib
@/lib/utils      → src/lib/utils
@/hooks          → src/hooks
```

## 🔧 MCP Server (For AI Agents)

The MCP server provides IDE integration for AI agents:

```bash
# Initialize MCP for your editor
npx shadcn@latest mcp init

# Supports: Claude Code, Cursor, VS Code, Codex, OpenCode
```

**What MCP provides:**

- Component discovery
- Auto-import suggestions
- Documentation lookup
- Registry search

## 🎨 Presets (Design System Configurations)

Presets encapsulate full design configs:

```bash
# List available presets
npx shadcn@latest search @shadcn  # Look for registry:style items

# Apply a preset (reconfigures theme, deps, components)
npx shadcn@latest init --preset <code>
```

## 🚀 Quick Commands for Agents

### 1. Check Before Installing

```bash
# Always preview first
npx shadcn@latest add COMPONENT --dry-run

# Then view the diff
npx shadcn@latest add COMPONENT --diff
```

### 2. Install Components

```bash
# Single component
npx shadcn@latest add button

# Multiple components
npx shadcn@latest add card badge avatar

# With overwrite (update existing)
npx shadcn@latest add button --overwrite

# From specific registry
npx shadcn@latest add @shadcn/button
```

### 3. Install Blocks (Page Templates)

```bash
# Dashboard with charts and data table
npx shadcn@latest add dashboard-01

# Sidebar layouts
npx shadcn@latest add sidebar-01

# Authentication pages
npx shadcn@latest add login-01
npx shadcn@latest add signup-01
```

### 4. View Documentation

```bash
# Get component docs in JSON (for agents)
npx shadcn@latest docs button --json

# View source code
npx shadcn@latest view button
```

## 📊 Registry Items Available

### UI Components (50+)

accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input, input-group, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

### Blocks (30+)

dashboard-01, sidebar-01 through sidebar-16, login-01 through login-05, signup-01 through signup-05, chart-area-_, chart-bar-_, chart-line-_, chart-pie-_, chart-radar-_, chart-radial-_

## 🔒 Safety Features

1. **--dry-run**: Preview changes without applying
2. **--diff**: See exact file modifications
3. **--view**: Inspect file contents
4. **Overwrite protection**: Warns before overwriting files

## 💡 Agent Best Practices

### When Adding Components:

1. **Always use --dry-run first**

   ```bash
   npx shadcn@latest add COMPONENT --dry-run
   ```

2. **Check the diff**

   ```bash
   npx shadcn@latest add COMPONENT --diff
   ```

3. **Then install**
   ```bash
   npx shadcn@latest add COMPONENT
   ```

### When Installing Blocks:

1. **Preview the block**

   ```bash
   npx shadcn@latest add dashboard-01 --dry-run
   ```

2. **Note dependencies**
   Blocks include many dependencies - check if conflicts exist

3. **Install**
   ```bash
   npx shadcn@latest add dashboard-01
   ```

### For Documentation:

```bash
# Get JSON docs for any component
npx shadcn@latest docs COMPONENT --json

# View component source
npx shadcn@latest view COMPONENT
```

## 🎯 Foundry-Specific Setup

### Current shadcn Components in Use:

- **Layout**: sidebar, card, sheet, separator
- **Forms**: input, textarea, select, checkbox, switch, form, label
- **Navigation**: breadcrumb, command, tabs
- **Feedback**: badge, skeleton, tooltip
- **Data**: table, scroll-area
- **Overlay**: dialog, dropdown-menu

### Recommended Blocks for Foundry:

- `dashboard-01` - For main dashboard (spaces overview)
- `sidebar-07` - For documentation sidebar layout
- `login-01` - Could enhance current login

### Registry Configuration:

Project uses built-in @shadcn registry:

```json
{
  "registries": {
    "@shadcn": "https://ui.shadcn.com/r/styles/{style}/{name}.json"
  }
}
```

## 📝 Summary

✅ **Fully Operational:**

- shadcn CLI v4.0.0
- 21 UI components installed
- MCP server ready
- All safety features (--dry-run, --diff, --view)
- Block system (30+ page templates available)
- Component documentation API
- Registry search (403 items)

🔄 **Next Steps:**

- Install `dashboard-01` block for enhanced dashboard
- Add more blocks as needed
- Use --dry-run before any installation
- Leverage MCP for IDE integration

## 🔗 Resources

- **shadcn/ui Docs**: https://ui.shadcn.com/docs
- **Registry**: https://ui.shadcn.com/r
- **v4 Release**: https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.0.0
