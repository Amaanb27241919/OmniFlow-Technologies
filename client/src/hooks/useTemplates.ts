import { useQuery } from "@tanstack/react-query";
import { AuditTemplate } from "../lib/auditTypes";

/**
 * Hook to fetch all available templates
 * @returns List of all templates
 */
export function useTemplates() {
  return useQuery({
    queryKey: ["/api/templates"],
    queryFn: async () => {
      const response = await fetch("/api/templates");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }
      return response.json() as Promise<AuditTemplate[]>;
    }
  });
}

/**
 * Hook to fetch a template by ID
 * @param id Template ID
 * @returns Template with the specified ID
 */
export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ["/api/templates", id],
    queryFn: async () => {
      if (!id) return null;
      
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch template");
      }
      return response.json() as Promise<AuditTemplate>;
    },
    enabled: !!id
  });
}

/**
 * Hook to fetch a template for a specific industry
 * @param industry Industry name
 * @returns Template for the specified industry
 */
export function useIndustryTemplate(industry: string | null) {
  return useQuery({
    queryKey: ["/api/templates/industry", industry],
    queryFn: async () => {
      if (!industry) return null;
      
      const response = await fetch(`/api/templates/industry/${industry}`);
      if (!response.ok) {
        throw new Error("Failed to fetch industry template");
      }
      return response.json() as Promise<AuditTemplate>;
    },
    enabled: !!industry
  });
}

/**
 * Hook to fetch a list of available industries
 * @returns List of available industries
 */
export function useIndustries() {
  return useQuery({
    queryKey: ["/api/industries"],
    queryFn: async () => {
      const response = await fetch("/api/industries");
      if (!response.ok) {
        throw new Error("Failed to fetch industries");
      }
      return response.json() as Promise<string[]>;
    }
  });
}