import re
import sys

def parse_makefile(filename):
    targets = {}
    recipes = {}
    with open(filename) as f:
        lines = f.readlines()
    i = 0
    while i < len(lines):
        line = lines[i].rstrip('\n')
        if not line.strip() or line.strip().startswith('#') or line.strip().startswith('.PHONY'):
            i += 1
            continue
        m = re.match(r'^([a-zA-Z0-9_\-]+):\s*(.*)', line)
        if m:
            target = m.group(1)
            deps = [d for d in m.group(2).split() if not d.startswith('-')]
            targets[target] = deps
            # Collect recipe lines
            recipe = []
            i += 1
            while i < len(lines) and (lines[i].startswith('\t') or lines[i].startswith('    ')):
                recipe.append(lines[i].strip())
                i += 1
            recipes[target] = recipe
        else:
            i += 1
    return targets, recipes

def make_mermaid(targets, recipes):
    node_ids = {}
    node_labels = {}
    node_counter = 0
    lines = ["flowchart TD"]
    # Assign node ids and labels
    for target in targets:
        node_id = chr(65 + node_counter)
        node_ids[target] = node_id
        node_labels[node_id] = target
        node_counter += 1
    # Add nodes and edges
    for target, deps in targets.items():
        t_id = node_ids[target]
        for dep in deps:
            if dep in node_ids:
                d_id = node_ids[dep]
                lines.append(f"    {d_id}[{dep}] --> {t_id}[{target}]")
        # Add recipe steps as nodes
        for idx, step in enumerate(recipes.get(target, [])):
            step_id = f"{t_id}{idx}"
            lines.append(f"    {t_id} --> {step_id}[{step}]")
    return "\n".join(lines)

def make_descriptions(targets, recipes):
    desc = []
    for target in targets:
        steps = recipes.get(target, [])
        if steps:
            desc.append(f"- **{target}**: Runs `{'; '.join(steps)}`")
        else:
            desc.append(f"- **{target}**: No recipe")
    return "\n".join(desc)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python generate_mermaid_from_makefile.py Makefile")
        sys.exit(1)
    targets, recipes = parse_makefile(sys.argv[1])
    print("# Project Build Flow\n")
    print("```mermaid")
    print(make_mermaid(targets, recipes))
    print("```\n")
    print(make_descriptions(targets, recipes))
