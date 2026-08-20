<?php

namespace App\Models;

use CodeIgniter\Model;

class AuditLogModel extends Model
{
    public function Log(string $module, int $recordId, string $action, ?int $actorId,
        ?int $statusBefore = null, ?int $statusAfter = null, ?array $changes = null,
        ?string $remarks = null, ?int $lineId = null, string $scope = 'header'): void
    {
        $this->db->table('audit_log')->insert([
            'module'        => $module,
            'record_id'     => $recordId,
            'line_id'       => $lineId,
            'scope'         => $scope,
            'action'        => $action,
            'actor_id'      => $actorId,
            'status_before' => $statusBefore,
            'status_after'  => $statusAfter,
            'changes'       => $changes !== null ? json_encode($changes) : null,
            'remarks'       => $remarks,
        ]);
    }

    // Diffs $before (a fresh DB row) against $after (the $data/$headerData array
    // the caller is about to write) over $fields only.
    public function DiffFields(array $before, array $after, array $fields): array
    {
        $out = [];
        foreach ($fields as $f) {
            $old = $before[$f] ?? null;
            $new = $after[$f] ?? null;
            if ($this->ValuesDiffer($old, $new)) {
                $out[$f] = ['old' => $old, 'new' => $new];
            }
        }
        return $out;
    }

    // MySQL returns DECIMAL columns as strings ("500.00"), while callers pass the
    // bare numeric value they're about to write (500) — a strict string compare
    // would flag every untouched decimal field as "changed". Only coerce to a
    // numeric compare when at least one side is decimal-formatted (has a '.'),
    // so integer-like codes (GL code, cost center, HSN/SAC) where a leading zero
    // is meaningful ("007" vs "7") still compare as plain strings.
    private function ValuesDiffer($old, $new): bool
    {
        $looksDecimal = static fn ($v) => is_string($v) && preg_match('/^-?\d+\.\d+$/', $v) === 1;
        if ((is_numeric($old) && is_numeric($new)) && ($looksDecimal($old) || $looksDecimal($new))) {
            return (float) $old !== (float) $new;
        }
        return (string) $old !== (string) $new;
    }
}
