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

import {IKeyValueStore} from './IKeyValueStore';
import cheese = require('swiss-cheese');

export class InMemoryKeyValueStore<ValueType, KeyType extends string|number=string> implements IKeyValueStore<ValueType, KeyType> {
  private readonly data: any = {};

  async create(key: KeyType, value: ValueType): Promise<void> {
    if (cheese.isSet(this.data[key])) {
      throw new Error(`Key '${key}' already exists`);
    }

    this.data[key] = value;
  }

  async delete(key: KeyType): Promise<ValueType> {
    const value = this.data[key];

    delete this.data[key];

    return value;
  }

  async get(key: KeyType): Promise<ValueType> {
    return this.data[key];
  }

  async getAll(): Promise<{[key in KeyType]: ValueType}> {
    const all: any = {};
    cheese.shallowCopyOwnProperties(this.data, all);

    return all;
  }

  async set(key: KeyType, value: ValueType): Promise<void> {
    this.data[key] = value;
  }

  async update(key: KeyType, value: ValueType): Promise<void> {
    if (cheese.notSet(this.data[key])) {
      throw new Error(`Key '${key}' does not exist`);
    }

    this.data[key] = value;
  }
}
