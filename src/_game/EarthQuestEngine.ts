import { Engine } from "../core/Engine";
import { SceneManager } from "../systems/SceneManager";
import { EarthQuestSceneManager } from "./SceneManager";


export class EarthQuestEngine extends Engine {

    createSceneManager(): SceneManager {
        return new EarthQuestSceneManager(this);
    }
}