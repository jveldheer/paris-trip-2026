'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Utensils,
  Eye,
  Zap,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { WishlistList } from '@/components/wishlist/wishlist-list'
import { AddWishlistItem } from '@/components/wishlist/add-wishlist-item'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTrip } from '@/lib/hooks/use-trip'
import { useRealtime } from '@/lib/hooks/use-realtime'
import { getSupabaseClient } from '@/lib/supabase/client'
import { getLocalItems, setLocalItems, updateLocalItem } from '@/lib/offline-storage'
import { WishlistItem, WishlistCategory } from '@/types'
import { WISHLIST_CATEGORY_LABELS } from '@/lib/constants'

const CATEGORY_TABS: {
  value: WishlistCategory
  label: string
  icon: LucideIcon
}[] = [
  { value: 'eat', label: 'Eat', icon: Utensils },
  { value: 'see', label: 'See', icon: Eye },
  { value: 'do', label: 'Do', icon: Zap },
  { value: 'buy', label: 'Buy', icon: ShoppingBag },
]

const STORAGE_KEY = 'offline_wishlist'

export default function WishlistPage() {
  const { trip, members, currentMember, isOffline } = useTrip()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<WishlistCategory>('eat')

  useEffect(() => {
    if (!trip) return

    if (isOffline) {
      setItems(getLocalItems<WishlistItem>(STORAGE_KEY))
      setLoading(false)
      return
    }

    const supabase = getSupabaseClient()
    supabase
      .from('wishlist_items')
      .select(
        '*, member:members!wishlist_items_member_id_fkey(*), checked_by_member:members!wishlist_items_checked_by_fkey(*)'
      )
      .eq('trip_id', trip.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setItems((data as WishlistItem[]) ?? [])
        setLoading(false)
      })
  }, [trip?.id, isOffline])

  useRealtime<WishlistItem>(
    'wishlist_items',
    useCallback((newItem) => {
      getSupabaseClient()
        .from('wishlist_items')
        .select(
          '*, member:members!wishlist_items_member_id_fkey(*), checked_by_member:members!wishlist_items_checked_by_fkey(*)'
        )
        .eq('id', newItem.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setItems((prev) => {
              if (prev.some((i) => i.id === (data as WishlistItem).id)) return prev
              return [...prev, data as WishlistItem]
            })
          }
        })
    }, []),
    useCallback((updatedItem: WishlistItem) => {
      getSupabaseClient()
        .from('wishlist_items')
        .select(
          '*, member:members!wishlist_items_member_id_fkey(*), checked_by_member:members!wishlist_items_checked_by_fkey(*)'
        )
        .eq('id', updatedItem.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setItems((prev) =>
              prev.map((i) => (i.id === (data as WishlistItem).id ? (data as WishlistItem) : i))
            )
          }
        })
    }, [])
  )

  async function handleToggle(item: WishlistItem) {
    if (!currentMember) return

    const newChecked = !item.checked
    const newCheckedBy = newChecked ? currentMember.id : null

    setItems((prev) => {
      const next = prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              checked: newChecked,
              checked_by: newCheckedBy,
              checked_by_member: newChecked ? currentMember : undefined,
            }
          : i
      )
      if (isOffline) setLocalItems(STORAGE_KEY, next)
      return next
    })

    if (!isOffline) {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('wishlist_items')
        .update({ checked: newChecked, checked_by: newCheckedBy })
        .eq('id', item.id)

      if (error) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  checked: item.checked,
                  checked_by: item.checked_by,
                  checked_by_member: item.checked_by_member,
                }
              : i
          )
        )
        console.error('Toggle failed:', error)
      }
    }
  }

  function handleAdd(newItem: WishlistItem) {
    setItems((prev) => {
      const next = prev.some((i) => i.id === newItem.id) ? prev : [...prev, newItem]
      if (isOffline) setLocalItems(STORAGE_KEY, next)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Wish List" />

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as WishlistCategory)}
        className="flex-1 flex flex-col"
      >
        <div className="sticky top-[53px] z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 pt-3 pb-0">
          <TabsList className="w-full grid grid-cols-4">
            {CATEGORY_TABS.map((cat) => {
              const Icon = cat.icon
              return (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="flex items-center gap-1.5 text-xs sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {cat.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {CATEGORY_TABS.map((cat) => {
          const catItems = items.filter((i) => i.category === cat.value)
          const Icon = cat.icon

          return (
            <TabsContent
              key={cat.value}
              value={cat.value}
              className="flex-1 p-4 pb-32 mt-0 focus-visible:outline-none"
            >
              {loading ? (
                <LoadingSkeleton variant="list" count={4} />
              ) : catItems.length === 0 ? (
                <EmptyState
                  icon={Icon}
                  title={`Nothing to ${cat.label.toLowerCase()} yet`}
                  description={`Add things you want to ${cat.label.toLowerCase()} on the trip!`}
                />
              ) : (
                <WishlistList
                  items={catItems}
                  members={members}
                  currentMemberId={currentMember?.id ?? ''}
                  onToggle={handleToggle}
                  tripId={trip?.id ?? ''}
                />
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {currentMember && trip && (
        <AddWishlistItem
          tripId={trip.id}
          memberId={currentMember.id}
          category={activeTab}
          onAdd={handleAdd}
          isOffline={isOffline}
        />
      )}
    </div>
  )
}
