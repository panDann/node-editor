import './index.less';
import cht from './test.cht';
import BitTreeTest from '@src/bit-tree/test';
import {BitTree,BitNode} from '@src/bit-tree/base-class';
import {Rect} from '@src/bit-tree/types';
import BitTreeCom from '@src/bit-tree';
import { useState } from 'react';
BitTreeTest()
const bt =  new BitTree<Rect>(new BitNode<Rect>({x:0,y:0,h:0,w:0}))
export default function IndexPage() {
  const [count, setCount] = useState(0)
  const onClick = () => {

  }
  
  return (
    <div>
        {/* <EBase option={option} /> */}
        <BitTreeCom bitTree={bt} />
    </div>
  );
}
