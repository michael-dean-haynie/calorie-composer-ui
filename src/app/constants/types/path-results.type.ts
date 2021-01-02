import { ContradictionSet } from './contradiction-set.type';
import { Path } from './path.type';

export interface PathResults {
    paths: Path[];
    contradictions: ContradictionSet[];
}