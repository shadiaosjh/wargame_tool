/**
 * 设置地图基本信息
 * @param {*} mapInfo 地图基本信息
 */
function setMapInfo (mapId) {
    window.EleDiv = 20;// 高程间隔
    window.maxRow = 74;
    window.maxCol = 70;
    window.firstID = 0;

    $.getJSON('/wgearth/terrain/terrain_id'+mapId+'.json', function(data) {

        let features = data.features;// 地图数据
        window.mapGrid = [];

        for (var j = 0; j < maxRow; j++) {
            mapGrid[j] = [];

            for (var k = 0; k < maxCol; k++) {
                mapGrid[j][k] = 0;
            }
        }

        let hexHalfWidth = 26;
        let hexHalfRowHeight = 45;
        for (let i = 0, length = features.length; i < length; i++) {
            let properties = features[i].properties;

            let hexID = parseInt(properties.hexid);

            let row = parseInt(hexID / 100);
            let col = (hexID % 100);
            if (row >= maxRow || col >= maxCol) {
                continue;
            }
            let obj = {
                mapid: properties.mapid,
                elevation: properties.groundid,
                step: properties.objstep,
                hex: properties.gridid,
                hextype: properties.gridtype,
                cond: properties.cond,
                left: 2 * hexHalfWidth * (hexID % 100) + hexHalfWidth * ((parseInt(hexID / 100) + 1) % 2 === 0 ? 1 : 0),
                top: hexHalfRowHeight * (Math.floor(hexID / 100))
            };

            mapGrid[row][col] = obj;

        }

    });
    $.getJSON('/static/cost/map_'+mapId+'_cost.json', function(data) {

        window.mapData = data;
        window.mapRow = mapData[0].length;
        mapCol = mapData[0][0].length;
    });

}

function getOperatorVisionScope (curPos, obsAbility) {

    let gridInDis = getGridInDis(curPos, obsAbility);
    let visionScope = [];
    for (let i = 0, length = gridInDis.length; i < length; i++) {
        let it = gridInDis[i];
        let hexIDNew = hexID(it);


        if (see(curPos, it)) {
            let mapGridNew = mapGrid[parseInt(hexIDNew / 100)][hexIDNew % 100];
            if (mapGridNew.hex === 52 || mapGridNew.hex === 51 || (mapGridNew.hextype === 2 && mapGridNew.cond === 7)) {
                if (getDistance(it, curPos) <= Math.floor(obsAbility / 2)) {
                    visionScope.push(it);
                }
            } else {
                visionScope.push(it);
            }
        }
    }

    return visionScope;
}


/**
 *
 *计算与源六角格的距离为dist的所有格
 * @param {*} Source 源六角格六位ID，数字形式
 * @param {*} dist 距离
 * @returns 六角格ID向量表
 * @memberof BQAnalysisModel
 */
function getGridInDis (Source, dist) {
    let gridInDis = [];
    let source = hexID(Source);
    let sourRow = Math.floor(source / 100);
    let sourColum = source % 100;
    let Right = 1;
    let Left = 1;
    let Down = 1;
    let Up = 1;

    let i = 0;
    let j = 1;

    let col = sourColum;
    let row = sourRow;
    /****************************************************/
    Right = 1; Up = 1;
    while (Right) {
        Up = 1;
        row = sourRow - i;
        col = sourColum;
        if (row >= 0 && row <= (maxRow - 1)) {
            if (getDistanceHexId(source, 100 * row + col) > dist) {
                Right = 0;
                Up = 0;
            }
            while (Up) {
                col = sourColum + j;
                if (col >= 0 && col <= (maxCol - 1)) {
                    if (getDistanceHexId(source, 100 * row + col) <= dist) {
                        gridInDis.push(sixBitID(100 * row + col));
                        j++;
                    } else {
                        Up = 0;
                        j = 0;
                        i++;
                    }
                } else {
                    Up = 0;
                    j = 0;
                    i++;
                }
            }
        } else {
            Right = 0;
        }
    }
    /****************************************************/
    Right = 1; Down = 1;
    i = 1; j = 0;
    while (Right) {
        Down = 1;
        row = sourRow + i;
        col = sourColum;
        if (row <= (maxRow - 1) && row >= 0) {
            if (getDistanceHexId(source, 100 * row + col) > dist) {
                Right = 0;
                Down = 0;
            }
            while (Down) {
                col = sourColum + j;
                if (col >= 0 && col <= (maxCol - 1)) {
                    if (getDistanceHexId(source, 100 * row + col) <= dist) {
                        gridInDis.push(sixBitID(100 * row + col));
                        j++;
                    } else {
                        Down = 0;
                        j = 0;
                        i++;
                    }
                } else {
                    Down = 0;
                    j = 0;
                    i++;
                }
            }
        } else {
            Right = 0;
        }
    }
    /****************************************************/
    Left = 1; Down = 1;
    i = 1; j = -1;
    while (Left) {
        Down = 1;
        row = sourRow + i;
        col = sourColum;
        if (row <= (maxRow - 1) && row >= 0) {
            if (getDistanceHexId(source, 100 * row + col) > dist) {
                Left = 0;
                Down = 0;
            }
            while (Down) {
                col = sourColum + j;
                if (col >= 0 && col <= (maxCol - 1)) {
                    if (getDistanceHexId(source, 100 * row + col) <= dist) {
                        gridInDis.push(sixBitID(100 * row + col));
                        j--;
                    } else {
                        Down = 0;
                        j = -1;
                        i++;
                    }
                } else {
                    Down = 0;
                    j = -1;
                    i++;
                }
            }
        } else {
            Left = 0;
        }
    }
    /****************************************************/
    Left = 1; Up = 1;
    i = 0; j = -1;
    while (Left) {
        Up = 1;
        row = sourRow - i;
        col = sourColum;
        if (row >= 0 && row <= (maxRow - 1)) {
            if (getDistanceHexId(source, 100 * row + col) > dist) {
                Left = 0;
                Up = 0;
            }
            while (Up) {
                col = sourColum + j;
                if (col >= 0 && col <= (maxCol - 1)) {
                    if (getDistanceHexId(source, 100 * row + col) <= dist) {
                        gridInDis.push(sixBitID(100 * row + col));
                        j--;
                    } else {
                        Up = 0;
                        j = -1;
                        i++;
                    }
                } else {
                    Up = 0;
                    j = -1;
                    i++;
                }
            }
        } else {
            Left = 0;
        }
    }
    /****************************************************/
    // sort(gridInDis.begin(), gridInDis.end());
    return gridInDis;
}
/**
 *六角网格六位ID转四位ID
 *输出4位ID
 * @param {int} str 六位ID
 * @returns 4位ID
 * @memberof BQAnalysisModel
 */

function hexID (str) {
    let NewRowID;
    let num;
    let RowID = Math.floor(str / 10000);// 原编号的行数
    let t = (str % 2 === 0) ? 0 : 1; // 奇数还是偶数
    // 如果原编号是偶数行
    if (t === 0) {
        NewRowID = RowID * 2;
    } else {
        NewRowID = RowID * 2 + 1;
    }
    num = str - RowID * 10000; // 原编号的零头
    num = Math.ceil((num) / 2);
    let tt = (num % 2 === 0) ? 0 : 1; // 零头是奇数还是偶数
    // 如果零头是奇数
    if (t === 1) {
        num--;
    }
    return NewRowID * 100 + num;
}

/**
 *计算六角格距离，输入为四位ID
 *
 * @param {*} sour 源六角格四位ID，数字形式
 * @param {*} dest 目标六角格四位ID，数字形式
 * @returns 距离
 * @memberof BQAnalysisModel
 */
function getDistanceHexId (sour, dest) {
    let sourRow = Math.floor(sour / 100);
    let sourColum = sour % 100;
    let destRow = Math.floor(dest / 100);
    let destColum = dest % 100;

    let rowDiff = Math.abs(sourRow - destRow);
    let columDiff = Math.abs(sourColum - destColum);

    let temp = 0;
    if (rowDiff & 1) {
        if (sourRow & 1) {
            if (sourColum < destColum) { columDiff -= 1; }
        } else {
            if (sourColum > destColum) { columDiff -= 1; }
        }
    }
    if (columDiff - Math.floor(rowDiff / 2) > 0) { temp = columDiff - Math.floor(rowDiff / 2); }
    return rowDiff + temp;
}

/**
 *四位ID转六位ID
 *
 * @param {*} fourBitID 四位ID
 * @returns 六位ID，数字形式
 * @memberof BQAnalysisModel
 */
function sixBitID (fourBitID) {
    let nrow = Math.floor(fourBitID / 100);
    let ncol;
    if (nrow % 2 === 0) {
        nrow = nrow / 2;
        ncol = (fourBitID % 100) * 2;
    } else {
        nrow = (nrow - 1) / 2;
        ncol = (fourBitID % 100) * 2 + 1;
    }
    return nrow * 10000 + ncol;
}

/**
 *
 *计算六角格距离，输入为六位ID
 * @param {*} Sour 源六角格六位ID，数字形式
 * @param {*} Dest 目标六角格六位ID，数字形式
 * @returns 距离
 * @memberof BQAnalysisModel
 */
function getDistance (Sour, Dest) {
    let sour = hexID(Sour);
    let dest = hexID(Dest);
    let sourRow = Math.floor(sour / 100);
    let sourColum = sour % 100;
    let destRow = Math.floor(dest / 100);
    let destColum = dest % 100;

    let rowDiff = Math.abs(sourRow - destRow);
    let columDiff = Math.abs(sourColum - destColum);

    let temp = 0;
    if (rowDiff & 1) {
        if (sourRow & 1) {
            if (sourColum < destColum) { columDiff -= 1; }
        } else {
            if (sourColum > destColum) { columDiff -= 1; }
        }
    }
    if (columDiff - Math.floor(rowDiff / 2) > 0) { temp = columDiff - Math.floor(rowDiff / 2); }
    return rowDiff + temp;
}

/**
 *通视模型
 * @param {*} Pos1
 * @param {*} Pos2
 * @returns
 * @memberof BQAnalysisModel
 */
function see (Pos1, Pos2) {

    let ObjPos, TarPos;
    let gg;
    let Tarrow;
    let Tarcol;
    let Objrow;
    let Objcol;
    let POS1 = hexID(Pos1);
    let POS2 = hexID(Pos2);

    let Dist = ceJu(Pos1, Pos2);

    if (Pos1 === Pos2) {
        return true;
    }

    let Ele1 = mapGrid[parseInt(POS1 / 100)][POS1 % 100].elevation;
    let Ele2 = mapGrid[parseInt(POS2 / 100)][POS2 % 100].elevation;

    // 按高点看低点原则
    if (Ele1 > Ele2) {
        ObjPos = POS1;
        TarPos = POS2;
        gg = true;
    }
    if (Ele2 > Ele1) {
        ObjPos = POS2;
        TarPos = POS1;
        gg = true;
    }
    if (Ele1 === Ele2) {
        ObjPos = (POS1 > POS2) ? POS1 : POS2;
        TarPos = (POS1 > POS2) ? POS2 : POS1;
        gg = false;
    }
    Tarrow = parseInt(TarPos / 100);
    Tarcol = TarPos % 100;
    Objrow = parseInt(ObjPos / 100);
    Objcol = ObjPos % 100;

    let objele = mapGrid[Objrow][Objcol].elevation;
    let tarele = mapGrid[Tarrow][Tarcol].elevation;
    // 高高程的单位增加1个高程
    if (gg === true) {
        objele += EleDiv;
    }
    let x1 = mapGrid[Objrow][Objcol].left;
    let y1 = mapGrid[Objrow][Objcol].top;
    let x2 = mapGrid[Tarrow][Tarcol].left;
    let y2 = mapGrid[Tarrow][Tarcol].top;

    let angle;
    if (x1 >= x2 && y1 < y2) {
        angle = Math.round(Math.atan((y1 - y2) / (x1 - x2)) * 180 / Math.PI + 360);
    } else {
        if (x1 >= x2) {
            angle = Math.round(Math.atan((y1 - y2) / (x1 - x2)) * 180 / Math.PI);
        } else {
            angle = Math.round(Math.atan((y1 - y2) / (x1 - x2)) * 180 / Math.PI + 180);
        }
    }
    let ss;
    if (angle === 0 || angle === 60 || angle === 120 || angle === 180 || angle === 240 || angle === 300) { ss = true; } else { ss = false; }
    let a = x1 + 29; // 六角格中心X坐标（29=58/2）
    let b = y1 + 29; // 六角格中心Y坐标（29=58/2）
    let Rot = angle - 90;
    let hudu = (2 * Math.PI / 360) * Rot;
    let DotNum = (ss === true) ? Dist : Dist * 3; // 模拟点总数：每1格3个模拟点就*3
    let MapID = 0;
    let MapID2 = 0;
    let SeeStopID = 0;

    for (let i = 1; i <= DotNum; i++) {
        let r = 52 * i; // 六角格之间的距离
        let rr = (ss === true) ? r : Math.round(r * 0.33); // 每隔1格设3个模拟点击点
        let X = Math.round(a + Math.sin(hudu) * rr);
        let Y = Math.round(b - Math.cos(hudu) * rr);
        MapID2 = MapID;
        MapID = hexID(gID(X, Y));
        let row = parseInt(MapID / 100);
        let col = MapID % 100;
        // cout << GID(X, Y) << endl;
        if (MapID2 !== MapID) { // 排除重复判断
            let thisele = mapGrid[row][col].elevation;
            if (mapGrid[row][col].hextype === 3 || mapGrid[row][col].cond === 7) {
                thisele += EleDiv; // 视线经过的遮蔽地形增加1个高程
            }
            if (MapID !== ObjPos && MapID !== TarPos) {
                if (seeStop(ObjPos, TarPos, MapID, objele, tarele, thisele, Dist) === false) {
                    SeeStopID = MapID;
                    return false;
                }
            }
            if (MapID === TarPos) { // 模拟点增长到目标格应该终止不要再按圆半径继续增长
                return true;
            }
        }
    }
    return true;
}

/**
 *计算六角网格距离
 *
 * @param {number} ObjPos 源六角网格六位ID   改成怀疑是4位编码
 * @param {number} TarPos 目标六角网格ID
 * @returns 距离
 * @memberof BQAnalysisModel
 */
function ceJu (ObjPos, TarPos) {
    // 计算格数公式
    // 必须满7位，否则不准
    let Pos1, Pos2;

    let pos1 = Math.floor(ObjPos) + 1000000;
    let pos2 = Math.floor(TarPos) + 1000000;

    let LookUp;
    Pos1 = pos1.toString();
    Pos2 = pos2.toString();

    let diffX = Math.abs(parseInt(Pos2.substr(Pos2.length - 4)) - parseInt(Pos1.substr(Pos1.length - 4)));
    let diffY = Math.abs(parseInt(Pos2.substr(0, 3)) - parseInt(Pos1.substr(0, 3)));

    LookUp = parseInt(Pos1.substr(0, 3)) > parseInt(Pos2.substr(0, 3));

    if (parseInt(Pos1.substr(0, 3)) === parseInt(Pos2.substr(0, 3))) {
        LookUp = (parseInt(Pos2) % 2 === 0);
    }
    let dist = 0;
    let diff = diffY * 2;

    if (pos1 % 2 !== 0) {
        if (pos2 % 2 === 0) {
            if (LookUp === true) {
                dist = diff + Math.ceil(diffX / 2) - diffY;
                diff = diff + 1;
            } else {
                diff = diff - 1;
                dist = diff + Math.ceil(diffX / 2) - diffY;
            }
        } else {
            dist = diff + Math.ceil(diffX / 2) - diffY;
        }
    } else {
        if (pos2 % 2 === 0) {
            dist = diff + Math.ceil(diffX / 2) - diffY;
        } else {
            if (LookUp === true) {
                diff = diff - 1;
                dist = diff + Math.ceil(diffX / 2) - diffY;
            } else {
                dist = diff + Math.ceil(diffX / 2) - diffY;
                diff = diff + 1;
            }
        }
    }
    if (dist < diff) {
        dist = diff;
    }
    return dist;
}

/**
 *通视判断函数
 *
 * @param {*} ObjPos
 * @param {*} TarPos
 * @param {*} MapID
 * @param {*} Ele1
 * @param {*} Ele2
 * @param {*} Ele3
 * @param {*} Dist
 * @returns
 * @memberof BQAnalysisModel
 */
function seeStop (ObjPos, TarPos, MapID, Ele1, Ele2, Ele3, Dist) {
    let EleDiff = Math.abs(Ele1 - Ele2) / EleDiv; // 观察者和目标之间的高差数
    let EleLow = (Ele1 > Ele2) ? Ele2 : Ele1;

    let DistDiff = ceJu(mapGrid[parseInt(MapID / 100)][MapID % 100].mapid, mapGrid[parseInt(TarPos / 100)][TarPos % 100].mapid);
    let h = 15.6; // 一点点试出来的
    let w = 23.8; // 一点点试出来的
    let y = h * EleDiff;
    let x = w * Dist;
    let hudu = Math.atan(y / x);
    let xx = w * DistDiff;
    let yy = Math.abs(Math.round(Math.tan(hudu) * xx)); // 高度视线图中的不遮挡高度
    let yyy = Math.round(((Ele3 - EleLow)) / EleDiv * h); // 中间点的高程在高度视线图中的高度
    if (yyy > yy) {
        return false;
    } else {
        return true;
    }
}

/**
 *
 *计算指定像素所在的六角格ID
 * @param {*} x 像素x值
 * @param {*} y 像素y值
 * @returns 输出：六角格ID，六位，数字形式
 * @memberof BQAnalysisModel
 */
function  gID (x, y) {
    let MapID;
    let xxx = x - 3; // e.x 和 e.clientX 相差3px
    let yyy = y - 5; // e.y 和 e.clientY 相差6px

    let Y = Math.floor(firstID / 10000); // 第1格ID的第1位数，如果y>0需要加这个数，y<0则不需要
    let X = Math.floor(firstID) - Y * 10000; // 第1格ID的最后几位数

    // y坐标为正做加法，y坐标为负做减法
    let YID = (y >= 0) ? Math.floor(Math.floor(yyy / 90) + Y) * 10000 : Math.floor(Y - Math.abs(Math.floor(yyy / 90)) - 1) * 10000;
    let XID0 = (x >= 0) ? Math.floor(xxx / 52) * 2 + X : X - Math.abs(Math.floor(xxx / 52) * 2) - 2;
    let XID1 = (x >= 0) ? Math.floor((Math.floor(xxx) + 26) / 52) * 2 + X : X - Math.abs(Math.floor((Math.floor(xxx) + 26) / 52) * 2) - 2;

    if (y >= 0) {
        if (firstID % 2 === 0) {
            if (parseInt((yyy / 45) % 2) === 0) {
                // 偶数行六角格X坐标正常
                MapID = YID + XID0;
            } else {
                // 奇数行六角格X坐标向右错半个格，最后一位数-1
                MapID = YID + XID1;
                MapID = Math.floor(MapID - 1);
            }
        } else {
            if (parseInt((yyy / 45) % 2) === 0) {
                MapID = YID + XID0;
            } else {
                MapID = YID + XID1;
                MapID = Math.floor(MapID + 10000 - 1);
            }
        }
    } else {
        if (firstID % 2 === 0) {
            if (parseInt((yyy / 45) % 2) === 0) {
                // 偶数行六角格X坐标向右错半个格，最后一位数-1
                MapID = YID + XID1;
                MapID = Math.floor(MapID - 1);
            } else {
                // 奇数行六角格X坐标正常
                MapID = YID + XID0;
            }
        } else {
            if (parseInt((yyy / 45) % 2) === 0) {
                MapID = YID + XID1;
                MapID = parseInt((MapID + 10000 - 1));
            } else {
                MapID = YID + XID0;
            }
        }
    }
    return MapID;
}

/**
 * t:position 起始位置
 * e:target car 或者people
 * i: weaponId
 */

function getDamageDisplay(t, e, i, r) {
    console.log('t',t);
    console.log('e',e);
    console.log('i',i);
    console.log('r',r);
    var n = []
        , o = this.hexID(t)
        , s = null;
    if ("car" === e ? directFireToCar[i] && (s = directFireToCar[i].range) : "people" === e && directFireToPeople[i] && (s = directFireToPeople[i].range),
        !s)
        return n;
    for (var a = 0; a < s; a++)
        for (var l = getGridEqualDis(t, a), h = 0, c = l.length; h < c; h++) {
            var u = hexID(l[h])
                , d = parseInt(u / 100)
                , p = u % 100;
            if (d < maxRow && p < maxCol && d >= 0 && p >= 0 && !0 === see(t, l[h])) {
                var f = mapGrid[d][p].elevation - mapGrid[parseInt(o / 100)][o % 100].elevation
                    , g = getDamageLevel(a, f, e, i, r);
                g > 0 && n.push({
                    mapId: l[h],
                    level: g
                })
            }
        }
    console.log(n);
    return n
}

function getDamageDisplayNew(A, e, t, i) {
    var c = [],
        I = this.hexID(A),
        n = null;
    if ("car" === e ? directFireToCar[t] && (n = directFireToCar[t].range) : "people" === e ? directFireToPeople[t] && (n = directFireToPeople[t].range) : "air" === e &&
        directFireToAir[t] && (n = directFireToAir[t].range), !n) return c;
    for (var l = 0; l < n; l++)
        for (var h = getGridEqualDis(A, l), a = 0, M = h.length; a < M; a++) {
            var m = hexID(h[a]),
                g = parseInt(m / 100),
                G = m % 100;
            if (g < maxRow && G < maxCol && g >= 0 && G >= 0 && !0 === see(A, h[a])) {
                var o = mapGrid[g][G].elevation - mapGrid[parseInt(I / 100)][I % 100].elevation,
                    R = this.getDamageLevelNew(l, o, e, t, i);
                R > 0 && c.push({
                    mapId: h[a],
                    level: R
                })
            }
        }
    return c
}

/**
 * t:position 起始位置
 * e:target car 或者people
 * i: weaponId
 */
function getDamageLevel(t, e, i, r, n) {
    var o = null;
    if ("car" === i)
        directFireToCar[r] && (o = directFireToCar[r].level[t]);
    else if ("people" === i) {
        o = directFireToPeople[r].level[n - 1][t]
    }
    return e > 0 && (e > 8 * EleDiv && (e = 8 * EleDiv),
    t > 12 && (t = 12),
        o += damageFix[parseInt(e / EleDiv) - 1][t - 1]),
        o
}

function getDamageLevelNew(A, e, t, i, c) {
    var I = null;
    if ("car" === t) directFireToCar[i] && (I = directFireToCar[i].level[A]);
    else if ("people" === t) {
        I = directFireToPeople[i].level[c - 1][A]
    } else if ("air" === t) {
        if (directFireToAir[i]) I = directFireToAir[i].level[A]
    }
    return e > 0 && (e > 8 * EleDiv && (e = 8 * EleDiv), A > 12 && (A = 12), I += damageFix[parseInt(e /
        EleDiv) - 1][A - 1]), I
}
/**
 *找到距离等于dist的位置
 * @param {*} Source 六位ID
 * @param {*} dist
 * @returns
 * @memberof BQAnalysisModel
 */
function getGridEqualDis (Source, dist) {
    let gridEqualDis = [];
    let tempId = Source + 2 * dist;
    gridEqualDis.push(tempId);
    let k = 0;
    while (k < dist) {
        if (tempId % 2 === 0) { tempId = tempId - 1; } else { tempId = tempId + 9999; }
        ++k;
        gridEqualDis.push(tempId);
    }
    k = 0;
    while (k < dist) {
        tempId = tempId - 2;
        ++k;
        gridEqualDis.push(tempId);
    }
    k = 0;
    while (k < dist) {
        if (tempId % 2 === 0) { tempId = tempId - 10001; } else { tempId = tempId - 1; }
        ++k;
        gridEqualDis.push(tempId);
    }
    k = 0;
    while (k < dist) {
        if (tempId % 2 === 0) { tempId = tempId - 9999; } else { tempId = tempId + 1; }
        ++k;
        gridEqualDis.push(tempId);
    }
    k = 0;
    while (k < dist) {
        tempId = tempId + 2;
        ++k;
        gridEqualDis.push(tempId);
    }
    k = 0;
    while (k < dist - 1) {
        if (tempId % 2 === 0) { tempId = tempId + 1; } else { tempId = tempId + 10001; }
        ++k;
        gridEqualDis.push(tempId);
    }

    return gridEqualDis;
}

/*
* A 六位坐标
* e 距离
* 显示距离内的所有六角格
* */
function getGridInDis(A, e){
    var t = [],
        i = hexID(A),
        c = Math.floor(i / 100),
        I = i % 100,
        n = 1,
        l = 1,
        h = 1,
        a = 1,
        M = 0,
        m = 1,
        g = I,
        G = c;
    for (n = 1, a = 1; n;)
        if (a = 1, g = I, (G = c - M) >= 0 && G <= maxRow - 1)
            for (getDistanceHexId(i, 100 * G + g) > e && (n = 0, a = 0); a;)(g = I + m) >= 0 && g <= maxCol -
            1 && getDistanceHexId(i, 100 * G + g) <= e ? (t.push(sixBitID(100 * G + g)), m++) : (a = 0,
                m = 0, M++);
        else n = 0;
    for (n = 1, h = 1, M = 1, m = 0; n;)
        if (h = 1, g = I, (G = c + M) <= maxRow - 1 && G >= 0)
            for (getDistanceHexId(i, 100 * G + g) > e && (n = 0, h = 0); h;)(g = I + m) >= 0 && g <= maxCol -
            1 && getDistanceHexId(i, 100 * G + g) <= e ? (t.push(sixBitID(100 * G + g)), m++) : (h = 0,
                m = 0, M++);
        else n = 0;
    for (l = 1, h = 1, M = 1, m = -1; l;)
        if (h = 1, g = I, (G = c + M) <= maxRow - 1 && G >= 0)
            for (getDistanceHexId(i, 100 * G + g) > e && (l = 0, h = 0); h;)(g = I + m) >= 0 && g <= maxCol -
            1 && getDistanceHexId(i, 100 * G + g) <= e ? (t.push(sixBitID(100 * G + g)), m--) : (h = 0,
                m = -1, M++);
        else l = 0;
    for (l = 1, a = 1, M = 0, m = -1; l;)
        if (a = 1, g = I, (G = c - M) >= 0 && G <= maxRow - 1)
            for (getDistanceHexId(i, 100 * G + g) > e && (l = 0, a = 0); a;)(g = I + m) >= 0 && g <= maxCol -
            1 && getDistanceHexId(i, 100 * G + g) <= e ? (t.push(sixBitID(100 * G + g)), m--) : (a = 0,
                m = -1, M++);
        else l = 0;
    return t
}


function aStarPathReaearchOld (Sour, Dest, operatorGradeability) {
    let sour = hexID(Sour);
    let dest = hexID(Dest);
    let neighbor;
    let path = [];
    let found;

    let aStar = [];
    for (let i = 0; i < maxRow; i++) {
        aStar[i] = [];
        for (let j = 0; j < maxCol; j++) {
            let starInit = {
                closed: 0,
                open: 0,
                H: 1000,
                G: 1000,
                F: 1000,
                tempF: 1000,
                tempG: 1000,
                tempM: 1000,
                father: 0
            };
            aStar[i][j] = starInit;
        }
    }
    if (sour === dest) {
        found = 1;
    } else {
        found = 0;
    }

    let minID = sour;

    let _row = parseInt(minID / 100);
    let _col = minID % 100;
    aStar[_row][_col].G = 0;
    aStar[_row][_col].H = getDistanceHexId(minID, dest);
    aStar[_row][_col].F = aStar[_row][_col].G + aStar[_row][_col].H;
    aStar[_row][_col].closed = 1;

    while (!found) {
        neighbor = getGridInDis(sixBitID(minID), 1);
        let sumAngle = 0;
        for (let ix = 0; ix < neighbor.length; ix++) {
            let cur = hexID(neighbor[ix]);
            let row = parseInt(cur / 100);
            let col = cur % 100;
            let temp = Math.abs(mapGrid[row][col].elevation - mapGrid[parseInt(minID / 100)][minID % 100].elevation);
            let angle = Math.round(Math.atan(temp / 200) * 180 / Math.PI);
            sumAngle += angle;

            if (angle <= operatorGradeability) { // 爬坡能力限制
                aStar[row][col].H = getDistanceHexId(cur, dest);
                let eleDiff = Math.abs(mapGrid[row][col].elevation - mapGrid[parseInt(minID / 100)][minID % 100].elevation) / 20;

                if (mapGrid[row][col].cond === 7) {
                    let temp = getNextMarchGrid(neighbor[ix]);
                    if (temp.indexOf(sixBitID(minID)) < 0) {
                        aStar[row][col].tempG = aStar[parseInt(minID / 100)][minID % 100].G + 3 +
                            (eleDiff >= 2 ? eleDiff - 1 : 0); // 高差>=2 才多余消耗机动力;
                    } else {
                        aStar[row][col].tempG = aStar[parseInt(minID / 100)][minID % 100].G + 1 +
                            (eleDiff >= 2 ? eleDiff - 1 : 0); // 高差>=2 才多余消耗机动力;
                    }
                } else {
                    aStar[row][col].tempG = aStar[parseInt(minID / 100)][minID % 100].G + mapGrid[row][col].step +
                        (eleDiff >= 2 ? eleDiff - 1 : 0); // 高差>=2 才多余消耗机动力;
                    aStar[row][col].tempF = aStar[row][col].H + aStar[row][col].tempG;
                }

                if (aStar[row][col].open === 1 && aStar[row][col].closed === 0) {
                    /* panyi 修改 */
                    if (aStar[row][col].F > aStar[row][col].tempF) {
                        aStar[row][col].father = minID;
                        aStar[row][col].F = aStar[row][col].tempF;
                        aStar[row][col].G = aStar[row][col].tempG;
                    }
                    /* panyi 修改 */
                }

                if (aStar[row][col].open === 0 && aStar[row][col].closed === 0) {
                    aStar[row][col].father = minID;
                    aStar[row][col].G = aStar[row][col].tempG;
                    aStar[row][col].F = aStar[row][col].tempF;
                    aStar[row][col].open = 1;
                }
            }
        }
        let minF = 1000;
        for (let i = 0; i < maxRow; i++) {
            for (let j = 0; j < maxCol; j++) {
                if (aStar[i][j].open === 1 && aStar[i][j].closed === 0) {
                    aStar[i][j].tempM = aStar[i][j].F;
                } else {
                    aStar[i][j].tempM = 1000;
                }

                if (minF >= aStar[i][j].tempM) {
                    minF = aStar[i][j].tempM;
                    minID = 100 * i + j;
                }
            }
        }
        aStar[parseInt(minID / 100)][minID % 100].closed = 1;
        aStar[parseInt(minID / 100)][minID % 100].open = 0;
        if (minID === dest || minID === (100 * (maxRow - 1) + maxCol - 1)) {
            found = 1;
        }
    }

    let back = 0;
    if (minID !== 100 * maxRow + maxCol) {
        path.push(sixBitID(minID));
        let cur = minID;

        while (!back) {
            let prev = aStar[parseInt(cur / 100)][cur % 100].father;
            path.push(sixBitID(prev));
            cur = prev;
            if (cur === sour) {
                back = 1;
            }
        }
    }

    return {
        grid: path,
        pay: aStar[parseInt(minID / 100)][minID % 100].F
    };
}

function aStarPathReaearch(A, e, t) {
    for (var i = hexID(A), c = hexID(e), I = void 0,
             n = [], l = void 0, h = [], a = 0; a < maxRow; a++) {
        h[a] = [];
        for (var M = 0; M < maxCol; M++) {
            h[a][M] = {
                closed: 0,
                open: 0,
                H: 1e3,
                G: 1e3,
                F: 1e3,
                tempF: 1e3,
                tempG: 1e3,
                tempM: 1e3,
                father: 0
            }
        }
    }
    l = i === c ? 1 : 0;
    var m = i,
        g = parseInt(m / 100),
        G = m % 100;
    for (h[g][G].G = 0, h[g][G].H = getDistanceHexId(m, c), h[
        g][G].F = h[g][G].G + h[g][G].H, h[g][G].closed = 1; !
             l;) {
        I = getGridInDis(sixBitID(m), 1);
        for (var o = 0; o < I.length; o++) {
            var R = hexID(I[o]),
                s = parseInt(R / 100),
                Q = R % 100,
                E = Math.abs(mapGrid[s][Q].elevation - mapGrid[parseInt(m / 100)][m % 100].elevation
                ),
                p = Math.round(180 * Math.atan(E / 200) / Math.PI);
            if (p, p <= t) {
                h[s][Q].H = getDistanceHexId(R, c);
                var D = Math.abs(mapGrid[s][Q].elevation -
                    mapGrid[parseInt(m / 100)][m % 100]
                        .elevation) / 20;
                if (7 === mapGrid[s][Q].cond) getNextMarchGrid(I[o]).indexOf(sixBitID(
                        m)) < 0 ? h[s][Q].tempG = h[parseInt(m /
                    100)][m % 100].G + 3 + (D >= 2 ? D - 1 :
                    0) : h[s][Q].tempG = h[parseInt(m / 100)][m %
                100
                    ].G + 1 + (D >= 2 ? D - 1 : 0);
                else h[s][Q].tempG = h[parseInt(m / 100)][m % 100]
                    .G + mapGrid[s][Q].step + (D >= 2 ? D -
                    1 : 0), h[s][Q].tempF = h[s][Q].H + h[s][Q]
                    .tempG;
                1 === h[s][Q].open && 0 === h[s][Q].closed && h[s][
                    Q].F > h[s][Q].tempF && (h[s][Q].father = m,
                    h[s][Q].F = h[s][Q].tempF, h[s][Q].G = h[s][
                    Q
                    ].tempG), 0 === h[s][Q].open && 0 === h[s][
                    Q].closed && (h[s][Q].father = m, h[s][Q]
                    .G = h[s][Q].tempG, h[s][Q].F = h[s][Q]
                    .tempF, h[s][Q].open = 1)
            }
        }
        for (var d = 1e3, N = 0; N < maxRow; N++)
            for (var Z = 0; Z < maxCol; Z++) 1 === h[N][Z]
                .open && 0 === h[N][Z].closed ? h[N][Z].tempM = h[N]
                [Z].F : h[N][Z].tempM = 1e3, d >= h[N][Z].tempM && (
                d = h[N][Z].tempM, m = 100 * N + Z);
        h[parseInt(m / 100)][m % 100].closed = 1, h[parseInt(m /
            100)][m % 100].open = 0, m !== c && m !== 100 * (
            maxRow - 1) + maxCol - 1 || (l = 1)
    }
    var b = 0;
    if (m !== 100 * maxRow + maxCol) {
        n.push(sixBitID(m));
        for (var Y = m; !b;) {
            var w = h[parseInt(Y / 100)][Y % 100].father;
            n.push(sixBitID(w)), (Y = w) === i && (b = 1)
        }
    }
    return {
        grid: n,
        pay: h[parseInt(m / 100)][m % 100].F
    }
}

function getPath(t, e, i) {
    if (t = parseInt(t), e = parseInt(e), !isPosValid(t) || !isPosValid(e) || t === e) return [];
    var r = parseInt(t / 100),
        n = t % 100;
    if (mapData[i][r][n].hasOwnProperty(e)) return [e];
    // var o = new Xh,
    //     s = {
    //         key: 0,
    //         value: t
    //     };
    var s = {
            key: 0,
            value: t
        };
    window.indexO = 0, window.queueO = [];

    insert(s);

    var a = {};
    a[t] = 0;
    var l = {};

    for (l[t] = vs; indexO;) {

        var h = getData().value;

        if (h === e) break;
        var c = parseInt(h),
            u = parseInt(c / 100),
            d = c % 100,
            p = mapData[i][u][d];

        for (var f in p) {
            var g = parseInt(f),
                _ = p[f],
                v = a[h] + _;
            (!a.hasOwnProperty(g) || v < a[g]) && (a[g] = v, l[g] = h, insert({
                    key: v + getDisBetweenHex(g, e),
                    value: g
                }))
        }
    }
    if (!l.hasOwnProperty(e)) return [];
    for (var m = [], y = e; y !== t;) m.push(y), y = l[y];
    return m.reverse(), m
}
function isPosValid(t) {
    var e = parseInt(t),
        i = parseInt(e / 100),
        r = e % 100;
    return i >= 0 && i < mapRow && r >= 0 && r < mapCol
}

function vs(t) {
    return t
}
function insert(t) {
    return queueO[++indexO] = t, swim(indexO), !0
}
function swim(t) {

    for (; t > 1 && compare(t >> 1, t);) exchange(t, t >> 1),
        t >>= 1
}
function compare(t, e) {
    return queueO[t].key > queueO[e].key || queueO[t]
        .key === queueO[e].key && queueO[t].value > queueO[e].value
}
function exchange(t, e) {
    var i = queueO[t];
    queueO[t] = queueO[e], queueO[e] = i
}
function getData() {
    if (0 === indexO) return null;
    var t = queueO[1];
    return exchange(1, indexO), indexO--, sink(1),
        queueO.splice(indexO + 1, 1), t
}
function sink(t) {
    for (; t << 1 <= indexO;) {
        var e = t << 1;
        if (e < indexO && compare(e, e + 1) && e++, !this
            .compare(t, e)) break;
        exchange(t, e), t = e
    }
}

function getDisBetweenHex(t, e) {
    if (!isPosValid(t) || isPosValid(e)) return -1;
    t = parseInt(t), e = parseInt(e);
    var i = parseInt(t / 100),
        r = t % 100,
        n = parseInt(e / 100),
        o = e % 100,
        s = r - Math.floor((i - (1 & i)) / 2),
        a = i,
        l = 0 - s - a,
        h = o - Math.floor((n - (1 & n)) / 2),
        c = n,
        u = 0 - h - c;
    return Math.floor((Math.abs(s - h) + Math.abs(a - c) + Math.abs(l -
        u)) / 2)
}


