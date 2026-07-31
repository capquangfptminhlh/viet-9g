export interface CanonicalEntity {
    id: string;
    name: string;
    aliases: string[];
    officialProfiles: string[];
    sameAs: string[];
    attributes: Record<string, any>;
    lastResolved: Date;
}

export interface ContradictionReport {
    entityId: string;
    field: string;
    conflictingValues: any[];
    resolvedValue: any;
    resolutionStrategy: string;
}

export class EntityResolver {
    private entities: Map<string, CanonicalEntity> = new Map();

    constructor() {}

    /**
     * Resolves an entity's canonical form based on provided data and existing data.
     */
    public resolveEntity(id: string, incomingData: Partial<CanonicalEntity>): CanonicalEntity {
        let entity = this.entities.get(id);
        
        if (!entity) {
            entity = {
                id,
                name: incomingData.name || 'Unknown',
                aliases: [],
                officialProfiles: [],
                sameAs: [],
                attributes: {},
                lastResolved: new Date(),
            };
        }

        // Merge Aliases
        if (incomingData.aliases) {
            entity.aliases = Array.from(new Set([...entity.aliases, ...incomingData.aliases]));
        }

        // Merge Official Profiles
        if (incomingData.officialProfiles) {
            entity.officialProfiles = Array.from(new Set([...entity.officialProfiles, ...incomingData.officialProfiles]));
        }

        // Merge sameAs links
        if (incomingData.sameAs) {
            entity.sameAs = Array.from(new Set([...entity.sameAs, ...incomingData.sameAs]));
        }

        // Resolve Contradictions in attributes
        if (incomingData.attributes) {
            entity.attributes = this.resolveContradictions(entity.attributes, incomingData.attributes, id);
        }

        if (incomingData.name && incomingData.name !== entity.name) {
             // Simple name resolution: overwrite
             entity.name = incomingData.name;
        }

        entity.lastResolved = new Date();
        this.entities.set(id, entity);
        
        return entity;
    }

    /**
     * Resolves contradictions between existing attributes and new attributes.
     */
    private resolveContradictions(existing: Record<string, any>, incoming: Record<string, any>, entityId: string): Record<string, any> {
        const resolved = { ...existing };
        const reports: ContradictionReport[] = [];

        for (const key of Object.keys(incoming)) {
            if (existing[key] !== undefined && existing[key] !== incoming[key]) {
                // Conflict detected. Apply resolution strategy ("latest-wins" here)
                const resolvedValue = incoming[key];
                
                reports.push({
                    entityId,
                    field: key,
                    conflictingValues: [existing[key], incoming[key]],
                    resolvedValue,
                    resolutionStrategy: 'latest-wins'
                });
                resolved[key] = resolvedValue;
            } else {
                resolved[key] = incoming[key];
            }
        }
        
        if (reports.length > 0) {
            this.logContradictions(reports);
        }

        return resolved;
    }
    
    private logContradictions(reports: ContradictionReport[]): void {
       // Mock logging
       console.log(`[EntityResolver] Resolved ${reports.length} contradictions.`);
    }

    public getEntity(id: string): CanonicalEntity | undefined {
        return this.entities.get(id);
    }
}
