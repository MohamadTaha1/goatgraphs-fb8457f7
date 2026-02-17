import { useEffect, useMemo, useState } from "react";
import { Edit, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TYPES = ["team", "league", "country", "season", "jersey_type"] as const;

type CategoryForm = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  parent_id: string;
  image_url: string;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  type: "team",
  parent_id: "none",
  image_url: "",
};

export default function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [editingId, setEditingId] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const load = () => supabase.from("categories").select("*").order("type").order("name").then(({ data }) => setCategories(data || []));

  useEffect(() => {
    document.title = "Categories - Admin";
    load();
  }, []);

  const generateSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || generateSlug(form.name),
      type: form.type as any,
      parent_id: form.parent_id === "none" ? null : form.parent_id,
      image_url: form.image_url.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editingId);
      if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
      else toast({ title: "Category updated" });
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) toast({ title: "Create failed", description: error.message, variant: "destructive" });
      else toast({ title: "Category added" });
    }
    load();
    resetForm();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else toast({ title: "Category deleted" });
    load();
  };

  const filtered = useMemo(() => {
    const typeFiltered = filterType === "all" ? categories : categories.filter(category => category.type === filterType);
    if (!query.trim()) return typeFiltered;
    const q = query.toLowerCase();
    return typeFiltered.filter(category => category.name.toLowerCase().includes(q) || category.slug.toLowerCase().includes(q));
  }, [categories, filterType, query]);

  return (
    <div>
      <h2 className="text-2xl font-bold">Categories</h2>
      <p className="mt-1 text-sm text-muted-foreground">Create and edit teams, leagues, countries, seasons, and jersey types.</p>

      <div className="mt-5 rounded-xl border border-border p-4">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          <Input
            placeholder="Category name"
            value={form.name}
            onChange={e => setForm(prev => ({ ...prev, name: e.target.value, slug: editingId ? prev.slug : generateSlug(e.target.value) }))}
          />
          <Input placeholder="slug" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} />
          <Select value={form.type} onValueChange={value => setForm(prev => ({ ...prev, type: value }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map(type => <SelectItem key={type} value={type} className="capitalize">{type.replace("_", " ")}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.parent_id} onValueChange={value => setForm(prev => ({ ...prev, parent_id: value }))}>
            <SelectTrigger><SelectValue placeholder="Parent category (optional)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No parent</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name} ({category.type.replace("_", " ")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))} className="md:col-span-2 xl:col-span-2" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={save}>
            <Plus className="mr-2 h-4 w-4" />
            {editingId ? "Update Category" : "Add Category"}
          </Button>
          {editingId && <Button variant="outline" onClick={resetForm}>Cancel</Button>}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Input placeholder="Search categories" value={query} onChange={e => setQuery(e.target.value)} className="w-full sm:w-72" />
        <Button variant={filterType === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterType("all")}>All</Button>
        {TYPES.map(type => (
          <Button key={type} variant={filterType === type ? "default" : "outline"} size="sm" onClick={() => setFilterType(type)} className="capitalize">
            {type.replace("_", " ")}
          </Button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {filtered.map(category => (
          <div key={category.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
            <div>
              <p className="font-semibold">{category.name}</p>
              <p className="text-xs text-muted-foreground">{category.slug} | {category.type.replace("_", " ")}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingId(category.id);
                  setForm({
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    type: category.type,
                    parent_id: category.parent_id || "none",
                    image_url: category.image_url || "",
                  });
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => del(category.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="py-8 text-center text-sm text-muted-foreground">No categories found.</p>}
      </div>
    </div>
  );
}
