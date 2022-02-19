export const Result = ({value, error}) => {
    const _result = {
        value,
        error,
    }
    _result.onSuccess = (callback) => callback(_result.value);
    _result.onFailure = (callback) => callback(_result.error);
    _result.isSuccess = () => !!_result.value;
    _result.isFailure = () => !!_result.error;
    _result.fold = (onSuccess, onFailure) => {
        if (_result.isSuccess())
            _result.onSuccess(onSuccess);
        if (_result.isFailure())
            _result.onFailure(onFailure)
    }
    _result.getOrElse = (defaultValue) => _result.isSuccess() ? _result.value : defaultValue;
    _result.map = (mapper) => {
        if (_result.isFailure())
            return _result;
        if (!Array.isArray(_result.value))
            _result.value = mapper(_result.value, 0);
        else
            _result.value = map(_result.value, mapper);
        return _result;
    }
    return _result;
}

Result.Ok = (value) => Result({value});
Result.Fail = (error) => Result({error});

function map(list, mapper, i = 0) {
    if (list.length <= 0) return [];
    const [first, ...rest] = list;
    return [mapper(first, i), map(rest, mapper, i + 1)];
}