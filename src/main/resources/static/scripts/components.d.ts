/// <reference types="jquery" />
/// <reference types="jquery" />
import { AddressInfo, GoodsInfo, ImgInfo } from "./types";
export declare function buildSearch(id: string, searchDefault?: string): string;
export declare function buildTopBar(curr?: string, search?: boolean, searchDefault?: string): string;
export declare function buildScrollImg(list: ImgInfo[]): string;
export declare function buildGoods(goods: GoodsInfo): string;
export declare function buildAddressEditor(id: string): string;
export declare function buildAddressItem(address: AddressInfo, buildDelete?: boolean): string;
export declare function showConfirm(title: string, type?: boolean, resCallback?: (() => void) | undefined, cancelText?: string, ensureText?: string): void;
export declare function showCropper(img: string, aspectRatio: number, ratioStr: string | null, callback: (img: HTMLCanvasElement) => void, cancel?: (() => void) | null): void;
export declare function buildGoodsList(goodsList: GoodsInfo[]): string;
export declare function relativeWords(input: JQuery<HTMLElement>, words: JQuery<HTMLElement>, max: number): void;
