/*
 * Copyright 2022 Rick Kern <kernrj@gmail.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import yaml = require('yaml');
import {IKeyValueStore} from './IKeyValueStore';
import fs = require('fs');
import cheese = require('swiss-cheese');

export class YamlKeyValueStore<ValueType, KeyType extends string|number=string> implements IKeyValueStore<ValueType, KeyType> {
  private readonly filename: string;
  private readonly rootObjectPath: any[];

  constructor(filename: string, rootObjectPath?: any[]) {
    this.filename = filename;

    this.rootObjectPath = cheese.isSet(rootObjectPath) ? rootObjectPath : [];
  }

  async create(key: KeyType, value: ValueType): Promise<void> {
    const data: {[key in KeyType]: ValueType} = await this.load();

    if (cheese.isSet(key)) {
      throw new Error(`Key '${key}' already exists`);
    }

    data[key] = value;

    await this.save(data);
  }

  async delete(key: KeyType): Promise<ValueType> {
    const data: {[key in KeyType]: ValueType} = await this.load();

    if (cheese.notSet(key)) {
      return;
    }

    const value = data[key];
    delete data[key];

    await this.save(data);

    return value;
  }

  async get(key: KeyType): Promise<ValueType> {
    const data = await this.load();

    return data[key];
  }

  async getAll(): Promise<{[key in KeyType]: ValueType}> {
    const all: {[key in KeyType]: ValueType} = await this.load();

    return all;
  }

  async set(key: KeyType, value: ValueType): Promise<void> {
    const data: {[key in KeyType]: ValueType} = await this.load();

    data[key] = value;

    await this.save(data);
  }

  async update(key: KeyType, value: ValueType): Promise<void> {
    const data: {[key in KeyType]: ValueType} = await this.load();

    if (cheese.notSet(key)) {
      throw new Error(`Key '${key}' does not exist`);
    }

    data[key] = value;

    await this.save(data);
  }

  private async load(): Promise<any> {
    let rootObject = yaml.parse((await fs.promises.readFile(this.filename)).toString('utf-8'));

    return cheese.getPath(rootObject, this.rootObjectPath, {}) as {[key in KeyType]: ValueType};
  }

  private async save(saveObj: any): Promise<void> {
    let fileContents: string;

    try {
      fileContents = (await fs.promises.readFile(this.filename)).toString('utf-8');
    } catch (e) {

    }

    const fullObject = cheese.isSet(fileContents) ? yaml.parse(fileContents) : {};
    cheese.set(fullObject, this.rootObjectPath, saveObj);

    return fs.promises.writeFile(this.filename, yaml.stringify(fullObject));
  }
}
