import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const client = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

export const set = async (key, value) => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_5c532092").upsert({
    key,
    value
  });
  if (error) {
    throw new Error(error.message);
  }
};

export const get = async (key) => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_5c532092").select("value").eq("key", key).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data?.value;
};

export const del = async (key) => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_5c532092").delete().eq("key", key);
  if (error) {
    throw new Error(error.message);
  }
};

export const mset = async (keys, values) => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_5c532092").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) {
    throw new Error(error.message);
  }
};

export const mget = async (keys) => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_5c532092").select("value").in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};

export const mdel = async (keys) => {
  const supabase = client()
  const { error } = await supabase.from("kv_store_5c532092").delete().in("key", keys);
  if (error) {
    throw new Error(error.message);
  }
};

export const getByPrefix = async (prefix) => {
  const supabase = client()
  const { data, error } = await supabase.from("kv_store_5c532092").select("key, value").like("key", prefix + "%");
  if (error) {
    throw new Error(error.message);
  }
  return data?.map((d) => d.value) ?? [];
};
