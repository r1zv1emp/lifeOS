'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Utensils, Droplets, Plus, Apple } from 'lucide-react'
import { useApi, apiPost } from '@/hooks/useApi'
import toast from 'react-hot-toast'
import {
  Button, Card, Modal, Input, Select, EmptyState, LoadingSpinner, PageHeader, Badge, ProgressRing
} from '@/components/ui'
import { MEAL_TYPES, cn } from '@/lib/utils'
import { format } from 'date-fns'

interface MealLog {
  id: string
  mealType: string
  name: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
}

interface WaterLog {
  id: string
  amount: number
  createdAt: string
}

interface DietData {
  meals: MealLog[]
  water: { total: number; logs: WaterLog[] }
  totals: { calories: number; protein: number; carbs: number; fat: number }
}

const CALORIE_GOAL = 2000
const WATER_GOAL = 2500
const PROTEIN_GOAL = 150

const mealIcons: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

function AddMealModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: () => void }) {
  const [form, setForm] = useState({
    name: '',
    mealType: 'lunch',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Enter a meal name')
    setLoading(true)
    const res = await apiPost('/api/diet', {
      ...form,
      calories: form.calories ? parseInt(form.calories) : undefined,
      protein: form.protein ? parseFloat(form.protein) : undefined,
      carbs: form.carbs ? parseFloat(form.carbs) : undefined,
      fat: form.fat ? parseFloat(form.fat) : undefined,
    })
    setLoading(false)
    if (res.success) {
      toast.success('Meal logged!')
      onAdd()
      onClose()
      setForm({ name: '', mealType: 'lunch', calories: '', protein: '', carbs: '', fat: '', notes: '', date: format(new Date(), 'yyyy-MM-dd') })
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Log Meal">
      <div className="space-y-4">
        <Input
          label="Meal Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g., Oatmeal with berries, Chicken rice..."
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Meal Type"
            value={form.mealType}
            onChange={v => setForm(f => ({ ...f, mealType: v }))}
            options={MEAL_TYPES}
          />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Calories (kcal)" type="number" value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} placeholder="500" />
          <Input label="Protein (g)" type="number" value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))} placeholder="40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Carbs (g)" type="number" value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))} placeholder="60" />
          <Input label="Fat (g)" type="number" value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))} placeholder="15" />
        </div>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} loading={loading} className="flex-1">Log Meal</Button>
        </div>
      </div>
    </Modal>
  )
}

const WATER_AMOUNTS = [150, 250, 350, 500]

export default function DietPage() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data, loading, refetch } = useApi<DietData>(`/api/diet?date=${today}`)
  const [mealOpen, setMealOpen] = useState(false)
  const [addingWater, setAddingWater] = useState(false)

  const totals = data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const waterMl = data?.water.total || 0
  const meals = data?.meals || []

  const caloriePercent = Math.min((totals.calories / CALORIE_GOAL) * 100, 100)
  const waterPercent = Math.min((waterMl / WATER_GOAL) * 100, 100)
  const proteinPercent = Math.min((totals.protein / PROTEIN_GOAL) * 100, 100)

  const handleWater = async (amount: number) => {
    setAddingWater(true)
    await apiPost('/api/diet', { type: 'water', amount, date: today })
    setAddingWater(false)
    toast.success(`+${amount}ml 💧`)
    refetch()
  }

  // Group meals by type
  const mealsByType = meals.reduce<Record<string, MealLog[]>>((acc, meal) => {
    if (!acc[meal.mealType]) acc[meal.mealType] = []
    acc[meal.mealType].push(meal)
    return acc
  }, {})

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader
        title="Diet Tracker"
        subtitle="Fuel your performance"
        action={<Button onClick={() => setMealOpen(true)} icon={<Plus size={16} />}>Log Meal</Button>}
      />

      {/* Macro Summary */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-5">Today's Nutrition</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Calories', value: totals.calories, goal: CALORIE_GOAL, unit: 'kcal', color: '#3b82f6' },
            { label: 'Protein', value: Math.round(totals.protein), goal: PROTEIN_GOAL, unit: 'g', color: '#10b981' },
            { label: 'Carbs', value: Math.round(totals.carbs), goal: 250, unit: 'g', color: '#f59e0b' },
            { label: 'Fat', value: Math.round(totals.fat), goal: 65, unit: 'g', color: '#8b5cf6' },
          ].map(macro => (
            <div key={macro.label} className="flex flex-col items-center gap-2">
              <ProgressRing
                value={macro.value}
                max={macro.goal}
                size={72}
                strokeWidth={5}
                color={macro.color}
                label={`${macro.value}`}
              />
              <div className="text-center">
                <p className="text-sm font-medium text-white">{macro.label}</p>
                <p className="text-xs text-zinc-500">{macro.value}/{macro.goal}{macro.unit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Water Tracker */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-cyan-400" />
            <h3 className="font-display font-semibold text-white text-sm">Water Intake</h3>
          </div>
          <span className="text-sm font-medium text-cyan-400">{Math.round(waterMl / 100) / 10}L / {WATER_GOAL / 1000}L</span>
        </div>

        <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${waterPercent}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {WATER_AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => handleWater(amt)}
              disabled={addingWater}
              className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 text-sm rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              <Droplets size={12} />
              +{amt}ml
            </button>
          ))}
        </div>
      </Card>

      {/* Meals */}
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Today's Meals</h2>
          {meals.length === 0 ? (
            <EmptyState
              icon={<Apple size={24} className="text-green-400" />}
              title="No meals logged today"
              description="Track what you eat to hit your nutrition goals."
              action={<Button onClick={() => setMealOpen(true)} icon={<Plus size={16} />}>Log First Meal</Button>}
            />
          ) : (
            ['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
              const typeMeals = mealsByType[type]
              if (!typeMeals?.length) return null
              const typeCalories = typeMeals.reduce((s, m) => s + (m.calories || 0), 0)
              return (
                <div key={type} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mealIcons[type]}</span>
                      <h3 className="font-medium text-white text-sm capitalize">{type}</h3>
                    </div>
                    <span className="text-xs text-zinc-500">{typeCalories} kcal</span>
                  </div>
                  <div className="space-y-2">
                    {typeMeals.map(meal => (
                      <div key={meal.id} className="flex items-center justify-between py-2 border-t border-white/5">
                        <p className="text-sm text-zinc-300">{meal.name}</p>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          {meal.protein && <span className="text-green-400">{meal.protein}g P</span>}
                          {meal.calories && <span>{meal.calories} kcal</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      <AddMealModal open={mealOpen} onClose={() => setMealOpen(false)} onAdd={refetch} />
    </div>
  )
}
