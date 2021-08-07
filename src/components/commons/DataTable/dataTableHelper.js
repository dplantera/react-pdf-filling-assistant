export function updateColumnsWidth(data, columns) {
    const minColWidthBase = 82;// played around
    const charWidthFactor = 8;// played around
    const minWidths = columns.reduce((acc, ts) => {
        acc[ts.field] = ts.width ?? minColWidthBase;
        return acc
    }, {})
    const headerLine = columns.map(header => ({[header.field]: header.headerName})).reduce((acc, curr) => {
        return {...acc, ...curr}
    }, {});
    const columnSizes = getColSizes([...data, headerLine], charWidthFactor, minWidths, minColWidthBase);
    const updatedColumns = columns.map(col => {
        const sizeContent = columnSizes[col.field];
        if (sizeContent)
            return {...col, width: sizeContent}
        return col;
    })
    return updatedColumns;
}

function getColSizes(data, charWidth, minColWidths, minColdWidthBase) {
    const getLength = (_value) => {
        if (typeof _value === "string")
            return _value.length;
        if (typeof _value === "number")
            return _value.toString().length;
        return 0;
    }
    const getMaxLength = (_key, _value, _map) => {
        let lengthValue = getLength(_value);
        if (Object.keys(_map).includes(_key))
            return Math.max(_map[_key], lengthValue)
        return lengthValue;
    }

    const keyToMaxWidth = {};
    data.forEach(d =>
        Object.keys(d).forEach(key =>
            keyToMaxWidth[key] = getMaxLength(key, d[key], keyToMaxWidth)
        )
    )

    const colSizes = Object.keys(keyToMaxWidth).reduce((acc, key) => {
        const colWidthByValues = minColdWidthBase + (keyToMaxWidth[key] * charWidth);
        const minColWidth = minColWidths[key];
        acc[key] = Math.max(colWidthByValues, minColWidth);
        return acc;
    }, {});
    return colSizes;
}

export function determineTableSchema(tableData, tableSchema) {
    const schemaForProperty = (key, header = key.toUpperCase()) => ({
        field: key,
        headerName: header
    })
    const getSchemaFromData = (_data) => {
        const schemaFromDataByKey = _data.reduce((dataSchema, curr) => {
            Object.keys(curr).forEach(key => {
                if (!dataSchema[key])
                    dataSchema = {...dataSchema, [key]: schemaForProperty(key)}
            })
            return dataSchema;
        }, {});
        return Object.keys(schemaFromDataByKey).map(key => ({...schemaFromDataByKey[key]}))
    }
    const mergeSchema = (_schemaFromData, _schemaFromTable) => {
        const schemaWithDuplicates = [..._schemaFromData, ..._schemaFromTable];
        return schemaWithDuplicates.reduce((acc, curr, index) => {
            if (acc.map(s => s.field).includes(curr.field))
                return acc;

            // get all duplicates
            const dups = schemaWithDuplicates.filter((dup) => ![...schemaWithDuplicates].splice?.(index + 1).map(el => el.field).includes(dup.field)
            );
            // merge duplicates
            const mergedDups = dups.reduce((dup, curDup) => {
                return {...dup, ...curDup}
            }, {})
            const definedSchema = tableSchema.find(ts => ts.field === curr.field) ?? {}
            acc.push({...mergedDups, ...definedSchema})

            return acc;
        }, []);
    }
    const schemaFromData = getSchemaFromData(tableData);
    if (tableSchema)
        return mergeSchema(schemaFromData, tableSchema);
    return schemaFromData;
}
