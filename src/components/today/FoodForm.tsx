"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import {
  createFoodEntry,
  deleteFoodEntry,
} from "@/lib/actions/food";
import type { FoodEntry } from "@/lib/types";

type Props = {
  date: string;
  foods: FoodEntry[];
  onChange: (foods: FoodEntry[]) => void;
};

export function FoodForm({ date, foods, onChange }: Props) {
  const [foodName, setFoodName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function addFood(event: React.FormEvent) {
    event.preventDefault();
    if (!foodName.trim()) return;

    try {
      setSaving(true);
      setError("");
      const food = await createFoodEntry({
        entry_date: date,
        food_name: foodName.trim(),
      });
      onChange([...foods, food]);
      setFoodName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add food.");
    } finally {
      setSaving(false);
    }
  }

  async function removeFood(id: string) {
    const next = foods.filter((food) => food.id !== id);
    onChange(next);
    try {
      await deleteFoodEntry(id);
    } catch (err) {
      onChange(foods);
      setError(err instanceof Error ? err.message : "Failed to delete food.");
    }
  }

  return (
    <Card title="Food Consumed Today">
      <form className="grid gap-4 md:grid-cols-[1fr_auto]" onSubmit={addFood}>
        <Input
          label="Food"
          onChange={(event) => setFoodName(event.target.value)}
          placeholder="Protein Shake"
          value={foodName}
        />
        <Button className="self-end" disabled={saving} type="submit">
          <Plus size={17} />
          Add Food
        </Button>
      </form>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-6 space-y-3">
        {foods.length === 0 ? (
          <EmptyState>No foods added for this date.</EmptyState>
        ) : (
          foods.map((food) => (
            <div
              className="flex items-center justify-between gap-3 rounded-[18px] border border-[#1A1A1A] bg-black/25 p-3"
              key={food.id}
            >
              <p className="min-w-0 truncate text-sm font-medium text-white">
                {food.food_name}
              </p>
              <Button
                aria-label="Delete food"
                className="h-9 w-9 px-0"
                onClick={() => removeFood(food.id)}
                type="button"
                variant="ghost"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
