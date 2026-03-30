import { ACTION_GROUP_ORDER } from '../game/data/actions';
import type { LegalAction } from '../game/types';

interface ActionGridProps {
  actions: LegalAction[];
  disabled: boolean;
  onSelect: (actionId: string) => void;
}

export function ActionGrid({ actions, disabled, onSelect }: ActionGridProps): JSX.Element {
  const actionsByGroup = ACTION_GROUP_ORDER
    .map((group) => ({
      group,
      items: actions.filter((action) => action.group === group)
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="action-groups">
      {actionsByGroup.map(({ group, items }) => (
        <section key={group} className="action-group">
          <div className="action-group__header">
            <h3>{group}</h3>
            <span>{items.length} legal</span>
          </div>
          <div className="action-grid">
            {items.map((action) => (
              <button
                key={action.id}
                type="button"
                className="action-card"
                disabled={disabled}
                onClick={() => onSelect(action.id)}
              >
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
