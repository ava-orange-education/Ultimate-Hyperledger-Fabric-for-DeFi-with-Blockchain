import { assetContract} from './assetContract';
import { Shim } from 'fabric-shim';

Shim.start(new assetContract());
