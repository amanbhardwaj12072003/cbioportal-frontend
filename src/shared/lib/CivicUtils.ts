import { MobxPromise } from 'cbioportal-frontend-commons';
import {
    CivicAlterationType,
    fetchCivicGenes as fetchDefaultCivicGenes,
    fetchCivicVariants as fetchDefaultCivicVariants,
    getCivicGenes,
    ICivicGeneIndex,
    ICivicVariantIndex,
    ICivicVariantSummary,
} from 'cbioportal-utils';
import { DiscreteCopyNumberData, Mutation } from 'cbioportal-ts-api-client';

import { concatMutationData } from './StoreUtils';

export function getCivicCNAVariants(
    copyNumberData: DiscreteCopyNumberData[],
    geneSymbol: string,
    civicVariants: ICivicVariantIndex
): { [name: string]: ICivicVariantSummary } {
    let geneVariants: { [name: string]: ICivicVariantSummary } = {};
    if (copyNumberData[0].alteration === 2) {
        for (let alteration in civicVariants[geneSymbol]) {
            if (alteration === CivicAlterationType.AMPLIFICATION) {
                geneVariants = {
                    [geneSymbol]: civicVariants[geneSymbol][alteration],
                };
            }
        }
    } else if (copyNumberData[0].alteration === -2) {
        for (let alteration in civicVariants[geneSymbol]) {
            if (alteration === CivicAlterationType.DELETION) {
                geneVariants = {
                    [geneSymbol]: civicVariants[geneSymbol][alteration],
                };
            }
        }
    }
    return geneVariants;
}

export function fetchCivicGenes(
    mutationData?: MobxPromise<Mutation[]>,
    uncalledMutationData?: MobxPromise<Mutation[]>
) {
    const mutationDataResult = concatMutationData(
        mutationData,
        uncalledMutationData
    );

    return fetchDefaultCivicGenes(
        mutationDataResult,
        (m: Mutation) => m.gene.entrezGeneId
    );
}

export function fetchCivicVariants(
    civicGenes: ICivicGeneIndex,
    mutationData?: MobxPromise<Mutation[]>,
    uncalledMutationData?: MobxPromise<Mutation[]>
) {
    const mutationDataResult = concatMutationData(
        mutationData,
        uncalledMutationData
    );

    return fetchDefaultCivicVariants(civicGenes, mutationDataResult);
}

export function fetchCnaCivicGenes(
    discreteCNAData: MobxPromise<DiscreteCopyNumberData[]>
): Promise<ICivicGeneIndex> {
    if (discreteCNAData.result && discreteCNAData.result.length > 0) {
        let entrezGeneSymbols: Set<number> = new Set([]);

        discreteCNAData.result.forEach(function(cna: DiscreteCopyNumberData) {
            entrezGeneSymbols.add(cna.gene.entrezGeneId);
        });

        let querySymbols: Array<number> = Array.from(entrezGeneSymbols);

        return getCivicGenes(querySymbols);
    } else {
        return Promise.resolve({});
    }
}
