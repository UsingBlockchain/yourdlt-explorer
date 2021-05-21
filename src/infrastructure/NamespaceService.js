/*
 *
 * Copyright (c) 2019-present for NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
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
 *
 */

import http from './http';
import helper from '../helper';
import Constants from '../config/constants';
import { ChainService, MetadataService, ReceiptService } from '../infrastructure';
import { Order, NamespaceId, UInt64, ReceiptType, Address } from 'symbol-sdk';
import globalConfig from '../config/globalConfig';

class NamespaceService {
  /**
   * Gets array of NamespaceName for different namespaceIds
   * @param namespaceIds - Array of namespace ids
   * @returns Formatted NamespaceName[]
   */
  static getNamespacesNames = async (namespaceIds) => {
  	let namespaceNames = await http.createRepositoryFactory.createNamespaceRepository()
  		.getNamespacesNames(namespaceIds)
  		.toPromise();

  	let formattedNamespacesName = namespaceNames.map(namespaceName => this.formatNamespaceName(namespaceName));

  	return formattedNamespacesName;
  }

  /**
   * Get readable names for a set of mosaics Returns friendly names for mosaics.
   * @param mosaicIds - Array of mosaic ids
   * @returns MosaicNames[]
   */
  static getMosaicsNames = async (mosaicIds) => {
  	const mosaicNames = await http.createRepositoryFactory.createNamespaceRepository()
  		.getMosaicsNames(mosaicIds)
  		.toPromise();
  	const formattedMosaicNames = mosaicNames.map(mosaicName => this.formatMosaicName(mosaicName));

  	return formattedMosaicNames;
  }

  /**
   * Returns friendly names for array of addresses.
   * @param addresses - Array of addresses
   * @returns AccountNames[]
   */
  static getAccountsNames = async (addresses) => {
  	const accountNames = await http.createRepositoryFactory.createNamespaceRepository()
  		.getAccountsNames(addresses)
  		.toPromise();

  	const formattedAccountNames = accountNames.map(accountName => this.formatAccountName(accountName));

  	return formattedAccountNames;
  }

  /**
   * Get namespace info and name from namespace Id
   * @param namespaceId - Namespace id
   * @returns formatted namespace info and name
   */
  static getNamespace = async (namespaceId) => {
  	let namespace = await http.namespaceService.namespace(namespaceId).toPromise();

  	let formattedNamespace = this.formatNamespace(namespace);

  	return formattedNamespace;
  }

  /**
   * Get linked address from namespace Id
   * @param namespaceId - Namespace id
   * @returns Address
   */
  static getLinkedAddress = async (namespaceId) => {
  	const address = await http.createRepositoryFactory.createNamespaceRepository()
  		.getLinkedAddress(namespaceId)
  		.toPromise();

  	return address;
  }

  /**
   * Get linked mosaicId from namespace Id
   * @param namespaceId - Namespace id
   * @returns mosaicId
   */
  static getLinkedMosaicId = async (namespaceId) => {
  	const mosaicId = await http.createRepositoryFactory.createNamespaceRepository()
  		.getLinkedMosaicId(namespaceId)
  		.toPromise();

  	return mosaicId;
  }

  /**
   * Gets a namespace list from searchCriteria
   * @param namespaceSearchCriteria Object of Search Criteria
   * @returns formatted namespace data with pagination info
   */
  static searchNamespaces = async (namespaceSearchCriteria) => {
  	const searchNamespaces = await http.createRepositoryFactory.createNamespaceRepository()
  		.search(namespaceSearchCriteria)
  		.toPromise();

  	// Convert NamespaceInfo[] to Namespace[]
  	const namespaces = await this.toNamespaces(searchNamespaces.data);

  	return {
  		...searchNamespaces,
  		data: namespaces.map(namespace => this.formatNamespace(namespace))
  	};
  }

  /**
   * Get namespace info for Vue Component
   * @param hexOrNamespace - hex value or namespace name
   * @returns customize namespace info Object
   */
  static getNamespaceInfo = async (hexOrNamespace) => {
  	const namespaceId = await helper.hexOrNamespaceToId(hexOrNamespace, 'namespace');

  	const namespace = await this.getNamespace(namespaceId);
  	const { height: currentHeight } = await ChainService.getChainInfo();

  	const {
  		isExpired,
  		expiredInBlock,
  		expiredInSecond
  	} = helper.calculateNamespaceExpiration(currentHeight, namespace.endHeight);

  	let formattedNamespaceInfo = {
  		...namespace,
  		duration: helper.convertTimeFromNowInSec(expiredInSecond) || Constants.Message.UNLIMITED,
  		status: isExpired ? Constants.Message.EXPIRED : Constants.Message.ACTIVE
  	};

  	// create alias props by alias type.
  	if (namespace.aliasType === Constants.Message.ADDRESS)
  		formattedNamespaceInfo.aliasAddress = namespace.alias;

  	if (namespace.aliasType === Constants.Message.MOSAIC)
  		formattedNamespaceInfo.aliasMosaic = namespace.alias;

  	// End height disable click before expired.
  	formattedNamespaceInfo.expiredInBlock = helper.isNativeNamespace(namespace.namespaceName) ? Constants.Message.INFINITY : expiredInBlock + ` ≈ ` + formattedNamespaceInfo.duration;

  	if (isExpired)
  		delete formattedNamespaceInfo.expiredInBlock;

  	if (currentHeight < formattedNamespaceInfo.endHeight) {
  		formattedNamespaceInfo.beforeEndHeight = helper.isNativeNamespace(namespace.namespaceName) ? Constants.Message.INFINITY : formattedNamespaceInfo.endHeight + ` ( ${http.networkConfig.NamespaceGraceDuration} blocks of grace period )`;
	  	delete formattedNamespaceInfo.endHeight;
  	}

  	return formattedNamespaceInfo;
  }

  /**
   * Gets NamespaceName list from Vue Component
   * @param hexOrNamespace - hex value or namespace name
   * @returns Namespace name list
   */
  static getNamespaceLevelList = async (hexOrNamespace) => {
  	let namespaceId = await helper.hexOrNamespaceToId(hexOrNamespace, 'namespace');

  	let namespacesName = await this.getNamespacesNames([namespaceId]);

  	return namespacesName;
  }

  /**
   * Get customize NamespaceInfo dataset into Vue Component
   * @param pageInfo - pagination info
   * @param filterVaule - object for search criteria
   * @returns customize NamespaceInfo[]
   */
  static getNamespaceList = async (pageInfo, filterVaule) => {
  	const { pageNumber, pageSize } = pageInfo;
  	const searchCriteria = {
  		pageNumber,
  		pageSize,
  		order: Order.Desc,
  		...filterVaule
  	};

  	const namespaceInfos = await this.searchNamespaces(searchCriteria);
  	const { height: currentHeight } = await ChainService.getChainInfo();

  	return {
  		...namespaceInfos,
  		data: namespaceInfos.data.map(namespace => {
			  const { isExpired, expiredInSecond, expiredInBlock } = helper.calculateNamespaceExpiration(currentHeight, namespace.endHeight);

  			return {
  				...namespace,
  				expirationDuration: helper.isNativeNamespace(namespace.namespaceName) ? Constants.Message.INFINITY : helper.convertTimeFromNowInSec(expiredInSecond),
  				isExpired: isExpired,
  				approximateExpired: helper.isNativeNamespace(namespace.namespaceName) ? Constants.Message.INFINITY : helper.convertSecondToDate(expiredInSecond),
  				expiredInBlock: expiredInBlock
  			};
  		})
  	};
  }

  /**
   * Gets namespace metadata list dataset into Vue component
   * @param pageInfo - object for page info such as pageNumber, pageSize
   * @param filterVaule - object for search criteria
   * @param hexOrNamespace - hex value or namespace name
   * @returns formatted mamespace Metadata list
   */
  static getNamespaceMetadataList = async (pageInfo, filterVaule, hexOrNamespace) => {
  	const namespaceId = await helper.hexOrNamespaceToId(hexOrNamespace, 'namespace');

  	const { pageNumber, pageSize } = pageInfo;

  	const searchCriteria = {
	   pageNumber,
	   pageSize,
	   order: Order.Desc,
	   targetId: namespaceId,
	   ...filterVaule
  	};
  	const namespaceMetadatas = await MetadataService.searchMetadatas(searchCriteria);

  	return namespaceMetadatas;
  }

  /**
   * Gets namespace balance transfer receipt list dataset into Vue component
   * @param pageInfo - object for page info such as pageNumber, pageSize
   * @param hexOrNamespace - hex value or namespace name
   * @returns formatted balance transfer receipt list
   */
  static getNamespaceBalanceTransferReceipt = async (pageInfo, hexOrNamespace) => {
  	const namespaceId = await helper.hexOrNamespaceToId(hexOrNamespace, 'namespace');

  	const { ownerAddress, startHeight } = await this.getNamespace(namespaceId);

  	const { pageNumber, pageSize } = pageInfo;

  	const searchCriteria = {
  		pageNumber,
  		pageSize,
  		order: Order.Desc,
  		height: UInt64.fromUint(startHeight),
  		receiptTypes: [ReceiptType.Namespace_Rental_Fee],
  		senderAddress: Address.createFromRawAddress(ownerAddress)
  	};

  	const balanceTransferReceipt = await ReceiptService.searchReceipts(searchCriteria);

  	const formattedReceipt = await ReceiptService.createReceiptTransactionStatement(balanceTransferReceipt.data.balanceTransferStatement);

  	return {
  		...balanceTransferReceipt,
  		data: formattedReceipt.filter(receipt =>
  			receipt.senderAddress === ownerAddress &&
		  receipt.type === ReceiptType.Namespace_Rental_Fee)
  	};
  }

  /**
   * Gets namespace artifact expiry receipt list dataset into Vue component
   * @param pageInfo - object for page info such as pageNumber, pageSize
   * @param hexOrNamespace - hex value or namespace name
   * @returns formatted artifact expiry receipt list
   */
  static getNamespaceArtifactExpiryReceipt = async (pageInfo, hexOrNamespace) => {
  	const namespaceId = await helper.hexOrNamespaceToId(hexOrNamespace, 'namespace');

  	const { endHeight } = await this.getNamespace(namespaceId);

  	const { pageNumber, pageSize } = pageInfo;

	  // Todo: Should filter with with ArtifactId rather than height.
	  // Bug: https://github.com/nemtech/catapult-rest/issues/517
  	const searchCriteria = {
  		pageNumber,
  		pageSize,
  		order: Order.Desc,
  		height: UInt64.fromUint(endHeight),
  		receiptTypes: [ReceiptType.Namespace_Expired, ReceiptType.Namespace_Deleted]
  	};

  	const artifactExpiryReceipt = await ReceiptService.searchReceipts(searchCriteria);
  	const formattedReceipt = await ReceiptService.createReceiptTransactionStatement(artifactExpiryReceipt.data.artifactExpiryStatement);

  	return {
  		...artifactExpiryReceipt,
  		data: formattedReceipt.filter(receipt => receipt.type === ReceiptType.Namespace_Expired || receipt.type === ReceiptType.Namespace_Deleted)
  	};
  }

  /**
   * Convert NamespaceInfo[] to Namespace[]
   * @param NamespaceInfo[] - array of NamespaceInfo
   * @returns Namespace[]
   */
  static toNamespaces = async (namespaceInfos) => {
  	const namespaceIdsList = namespaceInfos.map(namespaceInfo => namespaceInfo.id);
  	const namespaceNames = await this.getNamespacesNames(namespaceIdsList);

  	return namespaceInfos.map(namespaceInfo => ({
  		...namespaceInfo,
  		id: namespaceInfo.id,
  		name: this.extractFullNamespace(namespaceInfo, namespaceNames)
  	}));
  }

  /**
   * Gets native namespaces name in from nemesis transactions.
   * @returns Namespace[]
   */
  static getNativeNamespaces = async () => {
  	const namespace = globalConfig.networkConfig.namespaceName;
  	const rootNamespace = namespace.split('.')[0];
  	const namespaceids = [rootNamespace, namespace].map(namespace => new NamespaceId(namespace));

  	const namespaceInfos = await Promise.all(namespaceids.map(async namespaceid => {
  		return (NamespaceService.getNamespace(namespaceid));
	  }));

  	return namespaceInfos;
  }

  /**
   * Format namespaceName to readable object
   * @param namespaceNameDTO
   * @returns readable namespaceNameDTO
   */
  static formatNamespaceName = namespaceName => ({
  	...namespaceName,
  	namespaceId: namespaceName.namespaceId.toHex(),
  	parentId: namespaceName?.parentId ? namespaceName.parentId.toHex() : Constants.Message.UNAVAILABLE
  })

  /**
   * Format alias to readable object
   * @param Alias
   * @returns readable Alias object
   */
  static formatAlias = alias => {
  	switch (alias.type) {
  	case 0:
  		return {
  			...alias,
  			aliasType: Constants.Message.UNAVAILABLE
  		};
  	case 1: // Mosaic id alias
  		return {
  			...alias,
  			aliasType: Constants.Message.MOSAIC,
  			alias: alias?.mosaicId.toHex()
  		};
  	case 2: // Address alias
  		return {
  			...alias,
  			aliasType: Constants.Message.ADDRESS,
  			alias: alias?.address.plain()
  		};
  	}
  }

  /**
   * Format namespace to readable object
   * @param namespace - namespace DTO
   * @returns readable namespaceDTO
   */
  static formatNamespace = namespace => ({
  	...namespace,
  	ownerAddress: namespace.ownerAddress.plain(),
  	namespaceName: namespace.name,
  	namespaceId: namespace.id.toHex(),
  	registrationType: Constants.NamespaceRegistrationType[namespace.registrationType],
  	startHeight: Number(namespace.startHeight.toString()),
  	endHeight: helper.isNativeNamespace(namespace.name)
  		? Constants.Message.INFINITY
  		: Number(namespace.endHeight.toString()),
  	active: namespace.active ? Constants.Message.ACTIVE : Constants.Message.INACTIVE,
  	...this.formatAlias(namespace.alias),
  	parentName: namespace.registrationType !== 0 ? namespace.name.split('.')[0] : '',
  	levels: namespace.levels
  })

  /**
   * Format mosaic name to readable object
   * @param mosaicName - mosaicName DTO
   * @returns readable mosaicName DTO
   */
  static formatMosaicName = mosaicName => ({
  	...mosaicName,
  	mosaicId: mosaicName.mosaicId.toHex()
  })

  /**
   * Format account name to readable object
   * @param accountName - accountName DTO
   * @returns readable accountName DTO
   */
  static formatAccountName = accountName => ({
  	...accountName,
  	address: accountName.address.plain(),
  	names: accountName.names.map(name => this.formatNamespaceName(name))
  })

  /**
   * Extract full name for Namespace
   * @param namespaceInfo - namespaceInfo DTO
   * @param namespaceNames - NamespaceName[]
   * @returns full name
   */
  static extractFullNamespace = (namespaceInfo, namespaceNames) => {
  	return namespaceInfo.levels.map((level) => {
  		const namespaceName = namespaceNames.find((name) => name.namespaceId === level.toHex());

  		if (namespaceName === undefined) throw new Error('Not found');
  		return namespaceName;
  	})
  		.map((namespaceName) => namespaceName.name)
  		.join('.');
  }
}

export default NamespaceService;
