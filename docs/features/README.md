# Feature Specifications

Dieser Ordner enthält Feature-spezifische Spezifikationen für einzelne Branches.

## Struktur

```
docs/
└── features/
    ├── auth-persistence/
    │   └── FEATURE_SPEC.md      # Kombinierte Spec + UI Reference
    ├── dark-mode/
    │   └── FEATURE_SPEC.md
    └── ui-polish/
        └── FEATURE_SPEC.md
```

## Wann wird eine Feature-Spec erstellt?

1. **Neuer Feature-Branch** wird erstellt
2. **Agent 1 (Prompt-Architect)** erstellt `FEATURE_SPEC.md` für dieses Feature
3. Die Spec enthält NUR was für dieses Feature relevant ist
4. **Agent 2 (Code-Executor)** bekommt diese Spec als Kontext

## FEATURE_SPEC.md Template

Siehe [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md) für das Standard-Template.
