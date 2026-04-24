# ADR-0002: 第一批文档和操作流程优先服务 Windows 桌面用户

**Date**: 2026-03-30
**Status**: accepted
**Deciders**: 项目维护者

## Context

当前项目目标用户主要在 Windows 桌面环境中进行配置，尤其依赖桌面客户端、图文步骤和命令提示符操作。如果一开始就同时完整覆盖 Windows、macOS、Linux，多平台差异会显著拉高理解成本和维护成本。

## Decision

第一批正式文档优先围绕 Windows 桌面用户编写，命令、截图和操作动作以 Windows 为主，macOS 和 Linux 作为后续补充分支。

## Alternatives Considered

### Alternative 1: 首批就做多平台完全并列
- **Pros**: 平台覆盖更全面。
- **Cons**: 页面更复杂，截图和步骤分叉明显。
- **Why not**: 不利于当前新手优先目标。

### Alternative 2: 只保留抽象描述，不写平台细节
- **Pros**: 页面短，更新快。
- **Cons**: 新手很难按步骤落地执行。
- **Why not**: 当前用户最需要的就是具体平台动作。

## Consequences

### Positive
- 截图、命令和页面叙述可以保持一致。
- 新手更容易照着做成功第一次配置。

### Negative
- 其他平台用户需要等待后续补充。

### Risks
- 维护者后续补多平台时，可能在正文里混入大量分支说明。应优先用单独页面或平台提示块来扩展。
